/**
 * @file sttService.js
 * @description CLOVA Speech STT 및 대화 전사 API 통신 서비스 모듈
 */
import { createTranscriptModel } from "../models/transcriptModel";

/**
 * 파일을 Base64 Data URL로 변환
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * 음성 파일 STT 전사 요청 (CLOVA Speech / 코어 전사)
 * 
 * @param {File|Blob} file - 변환할 오디오 파일
 * @param {Object} [options={}] - { engine: 'clova'|'whisper', signal }
 * @returns {Promise<{ dialogues: Array, text: string, transcript: Object, duration: number }>}
 */
export async function requestSTT(file, options = {}) {
  if (!file) {
    throw new Error("변환할 음성 파일이 없습니다.");
  }

  const dataUrl = await fileToDataUrl(file);

  const response = await fetch("/api/interview/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filename: file.name || "audio.wav",
      data: dataUrl,
      engine: options.engine || "clova"
    }),
    signal: options.signal
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP ${response.status} 오류가 발생했습니다.`;
    throw new Error(errorMsg);
  }

  const transcript = data.transcript || createTranscriptModel(data);

  return {
    dialogues: data.dialogues || [],
    text: data.text || transcript?.text || "",
    duration: data.duration || 0,
    transcript,
    engine: data.engine || "clova"
  };
}
