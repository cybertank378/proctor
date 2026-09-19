// Files: src/modules/exam-session/presentations/hook/useAntiCheatEngine.ts
"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import type {ViolationType} from "@/generated/prisma/enums";
import {useExamSessionApi} from "./useExamSessionApi";

interface UseAntiCheatOptions {
  readonly quizId: number;
  readonly attemptId?: number;
  readonly studentIdentifier?: string;
  readonly isExamActive: boolean;
  readonly maxTolerance?: number;
}

export function useAntiCheatEngine({
  quizId,
  attemptId,
  studentIdentifier = "Siswa",
  isExamActive,
  maxTolerance = 3,
}: UseAntiCheatOptions) {
  const { recordViolation } = useExamSessionApi();

  const [violationCount, setViolationCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const captureSnapshot = useCallback((): string | undefined => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return undefined;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.6);
  }, []);

  const triggerViolation = useCallback(
    async (type: ViolationType, reason: string) => {
      if (!isExamActive || isLocked) return;

      const screenshot = captureSnapshot();
      setLastWarning(reason);

      const res = await recordViolation({
        quizId,
        attemptId,
        studentIdentifier,
        violationType: type,
        reason,
        timestamp: new Date().toISOString(),
        screenshotBase64: screenshot,
      });

      setViolationCount((prev) => {
        const next = prev + 1;
        if (next >= maxTolerance || res?.isLocked) {
          setIsLocked(true);
        }
        return next;
      });
    },
    [
      isExamActive,
      isLocked,
      quizId,
      attemptId,
      studentIdentifier,
      maxTolerance,
      captureSnapshot,
      recordViolation,
    ],
  );

  useEffect(() => {
    if (!isExamActive || isLocked) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        void triggerViolation(
          "TAB_SWITCH",
          "Siswa terdeteksi beralih tab atau meminimalkan browser ujian.",
        );
      }
    };

    const onWindowBlur = () => {
      void triggerViolation(
        "WINDOW_BLUR",
        "Jendela ujian kehilangan fokus (terdeteksi membuka aplikasi lain).",
      );
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [isExamActive, isLocked, triggerViolation]);

  return {
    videoRef,
    canvasRef,
    violationCount,
    isLocked,
    lastWarning,
    triggerViolation,
  };
}
