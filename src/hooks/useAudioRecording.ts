import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAudioRecordingOptions {
  mimeType?: string;
  maxDurationMs?: number;
  onComplete?: (blob: Blob) => void;
}

export interface UseAudioRecordingResult {
  isRecording: boolean;
  isSupported: boolean;
  durationMs: number;
  error: string | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

const pickMimeType = (preferred?: string): string | undefined => {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    preferred,
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ].filter(Boolean) as string[];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
};

export function useAudioRecording(
  options: UseAudioRecordingOptions = {}
): UseAudioRecordingResult {
  const { mimeType: preferredMime, maxDurationMs, onComplete } = options;

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  const cleanup = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser');
      return;
    }
    try {
      setError(null);
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType(preferredMime);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        cleanup();
        onComplete?.(blob);
      };

      recorder.onerror = (event) => {
        setError((event as ErrorEvent).message || 'Recording error');
        setIsRecording(false);
        cleanup();
      };

      startTimeRef.current = Date.now();
      setDurationMs(0);
      tickRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDurationMs(elapsed);
        if (maxDurationMs && elapsed >= maxDurationMs) {
          stop();
        }
      }, 100);

      recorder.start(100);
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      cleanup();
    }
  }, [audioUrl, cleanup, isSupported, maxDurationMs, onComplete, preferredMime, stop]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationMs(0);
    setError(null);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  return {
    isRecording,
    isSupported,
    durationMs,
    error,
    audioBlob,
    audioUrl,
    start,
    stop,
    reset,
  };
}
