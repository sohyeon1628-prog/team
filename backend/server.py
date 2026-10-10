"""우리 백엔드(Render 배포용) — AI·사진 프록시. **표준 라이브러리만** 쓴다.

앱(코어)에는 운영키가 없다(ARCHITECTURE.md). 이 서비스가 키를 보관하고 대신 호출하며,
앱이 보낸 **사용자 JWT**를 Supabase 로 검증한다.

환경변수
    PORT (=Render 주입)   기본 8765
    HOST                  기본 0.0.0.0
    OPENAI_API_KEY        필수
    UNSPLASH_ACCESS_KEY   사진 검색
    SUPABASE_URL          JWT 검증용 (https://<ref>.supabase.co)
    SUPABASE_ANON_KEY     JWT 검증용 apikey
    AUTH_REQUIRED         기본 true. false 는 개발 전용(토큰 없이 허용)
    OPENAI_BASE_URL       기본 https://api.openai.com/v1 (시험용 대체 가능)
    UNSPLASH_BASE_URL     기본 https://api.unsplash.com
    RATE_LIMIT_PER_MIN    기본 120 (사용자별)
    CF_ACCOUNT_ID         임베딩(Cloudflare Workers AI) 계정 id
    CF_API_TOKEN          임베딩용 Workers AI 토큰
    CF_BASE_URL           기본 https://api.cloudflare.com/client/v4 (시험용 대체 가능)

앱 계약
    GET  /ai/health
    POST /ai/responses | /ai/images/generations      (본문·응답을 그대로 중계)
    POST /ai/audio/transcriptions                    (녹음 전사, multipart 본문 그대로 중계)
    POST /ai/embeddings                              (Cloudflare Workers AI qwen3-embedding-0.6b 로 본문 그대로 중계)
    GET  /unsplash/search/photos | /unsplash/photos/<id> | /unsplash/download/<...> | /unsplash/absolute?url=

무저장: 요청·응답 본문을 로그나 디스크에 남기지 않는다(경로·상태·사용자만).
"""
from __future__ import annotations

import base64
import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from email.parser import BytesParser
from email.policy import default
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

OPENAI_BASE = (os.environ.get('OPENAI_BASE_URL') or 'https://api.openai.com/v1').rstrip('/')
UNSPLASH_BASE = (os.environ.get('UNSPLASH_BASE_URL') or 'https://api.unsplash.com').rstrip('/')
SUPABASE_URL = (os.environ.get('SUPABASE_URL') or '').rstrip('/')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', '')
AUTH_REQUIRED = os.environ.get('AUTH_REQUIRED', 'true').lower() != 'false'
ALLOWED_AI = {'responses', 'images/generations', 'audio/transcriptions', 'embeddings'}
CF_BASE = (os.environ.get('CF_BASE_URL') or 'https://api.cloudflare.com/client/v4').rstrip('/')
CF_EMBEDDING_MODEL = '@cf/qwen/qwen3-embedding-0.6b'  # 모델은 서버가 고정한다 — 앱이 다른 모델을 고르지 못하게
CLOVA_SPEECH_INVOKE_URL = (os.environ.get('CLOVA_SPEECH_INVOKE_URL') or '').rstrip('/')
CLOVA_SPEECH_SECRET_KEY = (os.environ.get('CLOVA_SPEECH_SECRET_KEY') or '').strip()
RATE_LIMIT = int(os.environ.get('RATE_LIMIT_PER_MIN', '120'))
TIMEOUT = 210

_LOCK = threading.Lock()
_HITS: dict[str, list[float]] = {}


def rate_ok(user: str) -> bool:
    now = time.time()
    with _LOCK:
        hits = [t for t in _HITS.get(user, []) if now - t < 60]
        if len(hits) >= RATE_LIMIT:
            _HITS[user] = hits
            return False
        hits.append(now)
        _HITS[user] = hits
    return True


_VERIFIED: dict[str, tuple[float, dict]] = {}
VERIFY_TTL = 60  # 같은 토큰을 매 요청마다 Supabase 에 묻지 않는다(임베딩처럼 요청이 잦은 경로). 폐기된 토큰은 최대 60초 더 통한다


def verify_user(token: str):
    """Supabase 에 토큰을 물어 신원을 확인한다(60초 캐시). 실패하면 None."""
    if not token or not SUPABASE_URL:
        return None
    hit = _VERIFIED.get(token)
    if hit and hit[0] > time.time():
        return hit[1]
    user = _verify_remote(token)
    if user:
        if len(_VERIFIED) > 500:
            _VERIFIED.clear()
        _VERIFIED[token] = (time.time() + VERIFY_TTL, user)
    return user


def _verify_remote(token: str):
    request = urllib.request.Request(
        SUPABASE_URL + '/auth/v1/user',
        headers={'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token},
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            data = json.load(response)
        return data if isinstance(data, dict) else None
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError):
        return None


def forward(url: str, body, headers: dict, method: str = 'GET'):
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            return response.status, response.headers.get_content_type(), response.read()
    except urllib.error.HTTPError as error:
        mime = error.headers.get_content_type() if error.headers else 'application/json'
        return error.code, mime, error.read()
    except (urllib.error.URLError, TimeoutError):
        return 504, 'application/json', json.dumps({'error': '업스트림에 연결하지 못했습니다.'}).encode()


def _build_clova_multipart(file_bytes: bytes, filename: str, mime_type: str) -> tuple[bytes, str]:
    """CLOVA Speech API 규격에 맞는 multipart/form-data 본문과 boundary 헤더 생성."""
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    params = {
        'language': 'ko-KR',
        'completion': 'sync',
        'wordAlignment': True,
        'fullText': True,
        'diarization': {'enable': True},
        'sed': {'enable': True},
    }
    params_json = json.dumps(params, ensure_ascii=False)

    body = bytearray()
    # 1. media 파트
    body.extend(f"--{boundary}\r\n".encode('utf-8'))
    body.extend(f'Content-Disposition: form-data; name="media"; filename="{filename}"\r\n'.encode('utf-8'))
    body.extend(f"Content-Type: {mime_type}\r\n\r\n".encode('utf-8'))
    body.extend(file_bytes)
    body.extend(b"\r\n")

    # 2. params 파트
    body.extend(f"--{boundary}\r\n".encode('utf-8'))
    body.extend(b'Content-Disposition: form-data; name="params"\r\n')
    body.extend(b"Content-Type: application/json; charset=UTF-8\r\n\r\n")
    body.extend(params_json.encode('utf-8'))
    body.extend(b"\r\n")

    # 끝 boundary
    body.extend(f"--{boundary}--\r\n".encode('utf-8'))

    content_type = f"multipart/form-data; boundary={boundary}"
    return bytes(body), content_type


def normalize_clova_transcript(raw: dict, filename: str, file_size: int, mime_type: str) -> dict:
    """CLOVA Speech 원본 응답을 ai-newsroom-os 표준 Transcript 규격으로 정규화."""
    raw_segments = raw.get('segments') or []
    norm_segments = []

    for idx, seg in enumerate(raw_segments):
        start = seg.get('start', 0) if isinstance(seg.get('start'), (int, float)) else 0
        end = seg.get('end', 0) if isinstance(seg.get('end'), (int, float)) else 0
        text = str(seg.get('text') or '')
        conf = seg.get('confidence', 0.0) if isinstance(seg.get('confidence'), (int, float)) else 0.0

        words = []
        raw_words = seg.get('words') or []
        for w_idx, w in enumerate(raw_words):
            if isinstance(w, list) and len(w) >= 3:
                words.append({
                    'wordIndex': w_idx,
                    'start': w[0] if isinstance(w[0], (int, float)) else 0,
                    'end': w[1] if isinstance(w[1], (int, float)) else 0,
                    'text': str(w[2] or ''),
                })
            elif isinstance(w, dict):
                words.append({
                    'wordIndex': w_idx,
                    'start': w.get('start', 0),
                    'end': w.get('end', 0),
                    'text': str(w.get('text') or ''),
                })

        # speaker 정보: diarization 결과 또는 speaker 객체 보존 (임의의 Speaker A/B 생성 금지)
        speaker = seg.get('speaker')
        if not speaker and seg.get('diarization'):
            speaker = {'label': seg['diarization'].get('label')}

        norm_segments.append({
            'segmentId': f"seg_{str(idx + 1).zfill(4)}",
            'index': idx + 1,
            'start': start,
            'end': end,
            'text': text,
            'confidence': conf,
            'words': words,
            'speaker': speaker,
        })

    full_text = str(raw.get('text') or '')
    if isinstance(raw.get('confidence'), (int, float)):
        confidence = float(raw['confidence'])
    elif norm_segments:
        confidence = sum(s['confidence'] for s in norm_segments) / len(norm_segments)
    else:
        confidence = 0.0

    now_iso = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    transcript_id = f"tr_{int(time.time() * 1000)}"

    transcript_obj = {
        'id': transcript_id,
        'text': full_text,
        'confidence': round(confidence, 4),
        'language': raw.get('language') or 'ko-KR',
        'segments': norm_segments,
        'metadata': {
            'sourceEngine': 'NAVER_CLOVA_SPEECH',
            'sourceFilename': filename or 'unknown_audio',
            'fileSize': file_size,
            'mimeType': mime_type or 'audio/wav',
            'createdAt': now_iso,
        },
    }

    return {
        'success': True,
        'job': {
            'id': f"job_stt_{int(time.time() * 1000)}",
            'status': 'COMPLETED',
            'type': 'AUDIO_TRANSCRIPTION',
            'filename': filename,
            'fileSize': file_size,
            'processedAt': now_iso,
        },
        'result': {
            'transcript': transcript_obj,
            'text': full_text,
            'confidence': round(confidence, 4),
            'segments': norm_segments,
            'raw': raw,
        },
    }


def _parse_audio_upload(content_type: str, body: bytes) -> tuple[bytes, str, str]:
    """클라이언트 요청 본문에서 오디오 파일 바이트, 파일명, MIME 타입 추출."""
    content_type_lower = content_type.lower()
    if 'multipart/form-data' in content_type_lower:
        header_bytes = f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode('latin-1')
        msg = BytesParser(policy=default).parsebytes(header_bytes + body)
        for part in msg.iter_parts():
            name = part.get_param('name', header='content-disposition')
            if name in ('audio', 'media', 'file'):
                payload = part.get_payload(decode=True)
                fname = part.get_filename() or 'audio.wav'
                mime = part.get_content_type() or 'application/octet-stream'
                return payload or b'', fname, mime
        for part in msg.iter_parts():
            if part.get_filename():
                return part.get_payload(decode=True) or b'', part.get_filename(), part.get_content_type()
    elif 'application/json' in content_type_lower:
        try:
            data = json.loads(body.decode('utf-8'))
            fname = data.get('filename') or 'audio.wav'
            raw_b64 = data.get('data') or data.get('audio') or ''
            if ',' in raw_b64:
                raw_b64 = raw_b64.split(',', 1)[1]
            file_bytes = base64.b64decode(raw_b64)
            return file_bytes, fname, 'audio/wav'
        except Exception:
            pass
    return body, 'audio.wav', 'application/octet-stream'


def call_clova_speech(file_bytes: bytes, filename: str, mime_type: str) -> tuple[int, dict]:
    """CLOVA Speech API 동기 호출. Secret Key는 절대 로그에 남기지 않는다."""
    invoke_url = CLOVA_SPEECH_INVOKE_URL
    secret_key = CLOVA_SPEECH_SECRET_KEY

    if not invoke_url or not secret_key:
        return 500, {
            'success': False,
            'error': 'CLOVA Speech 환경변수가 설정되지 않았습니다.',
            'detail': '환경변수 미설정 (CLOVA_SPEECH_SECRET_KEY 또는 CLOVA_SPEECH_INVOKE_URL)'
        }

    # URL 정규화 (/recognizer/upload)
    base_url = invoke_url.rstrip('/')
    request_url = base_url if base_url.endswith('/recognizer/upload') else f"{base_url}/recognizer/upload"

    multipart_body, content_type_hdr = _build_clova_multipart(file_bytes, filename, mime_type)

    req = urllib.request.Request(
        request_url,
        data=multipart_body,
        headers={
            'X-CLOVASPEECH-API-KEY': secret_key,
            'Content-Type': content_type_hdr,
            'User-Agent': 'AINewsroomProxy/1.0',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            resp_bytes = resp.read()
            raw_data = json.loads(resp_bytes.decode('utf-8'))
            normalized = normalize_clova_transcript(raw_data, filename, len(file_bytes), mime_type)
            return resp.status, normalized
    except urllib.error.HTTPError as err:
        try:
            err_data = json.loads(err.read().decode('utf-8'))
        except Exception:
            err_data = {'message': err.reason}
        return err.code, {
            'success': False,
            'error': f'CLOVA Speech API 오류 ({err.code})',
            'detail': err_data
        }
    except (urllib.error.URLError, TimeoutError) as net_err:
        return 504, {
            'success': False,
            'error': 'CLOVA Speech 서버에 연결할 수 없거나 응답 시간이 초과되었습니다.',
            'detail': str(net_err)
        }
    except Exception as ex:
        return 500, {
            'success': False,
            'error': 'STT 처리 중 서버 오류가 발생했습니다.',
            'detail': str(ex)
        }


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *args):
        pass  # 본문·토큰을 남기지 않는다

    def _send(self, status, payload, mime='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        # 연결을 재사용하지 않는다. 본문을 읽지 않고 응답한 경우(401/404 등) 남은 본문 바이트가
        # 다음 요청으로 파싱되어 501/400 이 나는 문제를 막는다(Render 프록시가 연결을 재사용한다).
        self.send_header('Connection', 'close')
        self.close_connection = True
        self.end_headers()
        try:
            self.wfile.write(payload)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _json(self, status, payload):
        self._send(status, json.dumps(payload, ensure_ascii=False).encode())

    def _body(self):
        size = int(self.headers.get('Content-Length', '0'))
        return self.rfile.read(size) if size > 0 else b''

    def _user_id(self):
        header = self.headers.get('Authorization', '')
        token = header[7:] if header.lower().startswith('bearer ') else ''
        if not AUTH_REQUIRED:
            return 'dev'
        user = verify_user(token)
        return (user or {}).get('id') or None

    def _guard(self):
        """통과하면 사용자 id, 아니면 응답을 이미 보내고 None."""
        user = self._user_id()
        if user is None:
            self._json(401, {'error': '로그인이 필요합니다.'})
            return None
        if not rate_ok(user):
            self._json(429, {'error': '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.'})
            return None
        return user

    def do_GET(self):
        path = urllib.parse.urlsplit(self.path)
        if path.path == '/ai/health':
            return self._json(200, {
                'ok': True,
                'service': 'ainewsroom-proxy',
                'authRequired': AUTH_REQUIRED,
                'openai': bool(os.environ.get('OPENAI_API_KEY')),
                'unsplash': bool(os.environ.get('UNSPLASH_ACCESS_KEY')),
                'embeddings': bool(os.environ.get('CF_ACCOUNT_ID') and os.environ.get('CF_API_TOKEN')),
                'clova': bool(os.environ.get('CLOVA_SPEECH_INVOKE_URL') and os.environ.get('CLOVA_SPEECH_SECRET_KEY')),
            })
        if self._guard() is None:
            return
        if path.path == '/unsplash/absolute':
            target = (urllib.parse.parse_qs(path.query).get('url') or [''])[0]
            if urllib.parse.urlsplit(target).hostname != 'api.unsplash.com':
                return self._json(400, {'error': '허용되지 않은 사진 주소입니다.'})
            status, mime, raw = forward(target, None, {
                'Authorization': 'Client-ID ' + os.environ.get('UNSPLASH_ACCESS_KEY', ''),  # 키 없이는 Unsplash 가 401 로 거절한다
                'Accept-Version': 'v1',
                'Accept': 'application/json',
                'User-Agent': 'AINewsroomProxy/1.0',
            })
            return self._send(status, raw, mime)
        if path.path.startswith('/unsplash/'):
            target = UNSPLASH_BASE + path.path[len('/unsplash'):] + (('?' + path.query) if path.query else '')
            status, mime, raw = forward(target, None, {
                'Authorization': 'Client-ID ' + os.environ.get('UNSPLASH_ACCESS_KEY', ''),
                'Accept-Version': 'v1',
                'User-Agent': 'AINewsroomProxy/1.0',
            })
            return self._send(status, raw, mime)
        self._json(404, {'error': '지원하지 않는 경로입니다.'})

    def do_POST(self):
        # 본문을 **먼저** 읽는다 — 401/404 로 조기 반환할 때 남은 본문이 다음 요청을 오염시키지 않게.
        body = self._body()
        path = urllib.parse.urlsplit(self.path).path

        # CLOVA Speech STT 음성인식 계약 (/api/stt)
        if path == '/api/stt':
            if self._guard() is None:
                return
            if not body:
                return self._json(400, {'success': False, 'error': '음성 파일이 선택되지 않았습니다.'})
            if len(body) > 100_000_000:
                return self._json(413, {'success': False, 'error': '음성 파일 크기가 너무 큽니다. (최대 100MB)'})
            ct = self.headers.get('Content-Type') or ''
            file_bytes, fname, mime = _parse_audio_upload(ct, body)
            if not file_bytes:
                return self._json(400, {'success': False, 'error': '음성 파일 데이터를 읽을 수 없습니다.'})
            status_code, resp_payload = call_clova_speech(file_bytes, fname, mime)
            return self._json(status_code, resp_payload)

        if not path.startswith('/ai/'):
            return self._json(404, {'error': '지원하지 않는 경로입니다.'})
        sub = path[len('/ai/'):]
        if sub not in ALLOWED_AI:
            return self._json(404, {'error': '지원하지 않는 AI 경로입니다.'})
        if self._guard() is None:
            return
        if len(body) > 40_000_000:
            return self._json(413, {'error': '요청이 너무 큽니다.'})
        if sub == 'embeddings':
            if len(body) > 2_000_000:
                return self._json(413, {'error': '요청이 너무 큽니다.'})
            account = os.environ.get('CF_ACCOUNT_ID', '')
            status, mime, raw = forward(
                f'{CF_BASE}/accounts/{account}/ai/run/{CF_EMBEDDING_MODEL}', body,
                {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + os.environ.get('CF_API_TOKEN', '')},
                method='POST')
            return self._send(status, raw, mime)
        status, mime, raw = forward(
            OPENAI_BASE + '/' + sub,
            body,
            {
                # 전사는 multipart 라 앱이 보낸 Content-Type(boundary 포함)을 그대로 넘긴다
                'Content-Type': self.headers.get('Content-Type') or 'application/json',
                'Authorization': 'Bearer ' + os.environ.get('OPENAI_API_KEY', ''),
            },
            method='POST',
        )
        self._send(status, raw, mime)


    def _not_allowed(self):
        # 지원하지 않는 메서드도 JSON 404 로 답한다(기본 501 HTML 은 본문을 남겨 연결을 오염시킬 수 있다).
        self._json(404, {'error': '지원하지 않는 경로입니다.'})

    do_PUT = do_PATCH = do_DELETE = do_OPTIONS = _not_allowed


def main():
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', '8765'))
    print(f'프록시 시작: http://{host}:{port} (authRequired={AUTH_REQUIRED})', flush=True)
    ThreadingHTTPServer((host, port), Handler).serve_forever()


if __name__ == '__main__':
    main()
