"use client";
import { useRef, useState } from "react";

export default function VoiceInput({ onTranscribed }: { onTranscribed: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  async function startRecording() {
    setError("");
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        try {
          const res = await fetch("/api/voice-to-text", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to transcribe");
          setTranscript(data.transcript);
          onTranscribed(data.transcript);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not access microphone");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        type="button"
        className={`btn px-4 py-2 rounded-full text-white font-semibold shadow-lg ${recording ? "bg-red-600" : "bg-gradient-to-r from-green-400 to-blue-500"}`}
        onClick={recording ? stopRecording : startRecording}
        aria-pressed={recording}
        aria-label={recording ? "Stop recording" : "Start voice input"}
      >
        {recording ? "Stop Recording" : "🎤 Voice Input"}
      </button>
      {error && <div className="text-red-400 text-xs font-semibold">{error}</div>}
      {transcript && (
        <div className="text-xs text-green-300">Transcript: {transcript}</div>
      )}
    </div>
  );
}
