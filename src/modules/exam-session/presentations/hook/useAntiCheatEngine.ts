// Files: src/modules/exam-session/presentations/hook/useAntiCheatEngine.ts
"use client";

import type React from "react";
import {useCallback, useEffect, useState} from "react";
import type Webcam from "react-webcam";
import type {ViolationType} from "@/generated/prisma/enums";

interface UseAntiCheatOptions {
  readonly quizId: number;
  readonly attemptId?: number;
  readonly studentIdentifier?: string;
  readonly isExamActive: boolean;
  readonly maxTolerance?: number;
  readonly webcamRef?: React.RefObject<Webcam | null>;
}

export function useAntiCheatEngine({
  quizId,
  attemptId,
  studentIdentifier = "Siswa",
  isExamActive,
  maxTolerance = 3,
  webcamRef,
}: UseAntiCheatOptions) {
  const [violationCount, setViolationCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  // Fungsi penangkapan snapshot visual langsung dari react-webcam
  const captureSnapshot = useCallback((): string => {
    try {
      if (webcamRef?.current) {
        const imageSrc = webcamRef.current.getScreenshot({
          width: 640,
          height: 480,
        });

        if (imageSrc && imageSrc.length > 50) {
          return imageSrc;
        }
      }
    } catch (err) {
      console.warn("[ANTI-CHEAT] Gagal mengambil snapshot dari webcam:", err);
    }

    // Fallback kanvas jika kamera ditutup atau belum siap
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(320, 220, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("KAMERA BELUM SIAP / DITUTUP", 320, 270);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(new Date().toLocaleString("id-ID"), 320, 295);
      return canvas.toDataURL("image/png");
    }

    return "";
  }, [webcamRef]);

  const triggerViolation = useCallback(
    async (type: ViolationType, reason: string) => {
      if (isLocked) return;

      const screenshot = captureSnapshot();
      setLastWarning(reason);

      const payload = {
        quizId: Number(quizId),
        attemptId: attemptId ? Number(attemptId) : undefined,
        studentIdentifier,
        violationType: type,
        reason,
        timestamp: new Date().toISOString(),
        screenshotBase64: screenshot,
      };

      try {
        const res = await fetch("/api/violations/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setViolationCount(json.data.currentViolations);
          if (json.data.isLocked) {
            setIsLocked(true);
          }
        } else {
          setViolationCount((prev) => {
            const next = prev + 1;
            if (next >= maxTolerance) setIsLocked(true);
            return next;
          });
        }
      } catch (err) {
        console.error("[ANTI-CHEAT DISPATCH ERROR]:", err);
      }
    },
    [
      isLocked,
      captureSnapshot,
      maxTolerance,
      quizId,
      attemptId,
      studentIdentifier,
    ],
  );

  useEffect(() => {
    if (!isExamActive || isLocked) return;

    let blurTimeout: NodeJS.Timeout | null = null;

    const onVisibilityChange = () => {
      if (document.hidden) {
        void triggerViolation(
          "TAB_SWITCH" as ViolationType,
          "Siswa terdeteksi beralih tab atau meminimalkan browser ujian.",
        );
      }
    };

    const onWindowBlur = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        if (
          document.activeElement instanceof HTMLIFrameElement ||
          document.activeElement?.tagName === "IFRAME"
        ) {
          return;
        }

        if (!document.hasFocus()) {
          void triggerViolation(
            "WINDOW_BLUR" as ViolationType,
            "Jendela ujian kehilangan fokus (terdeteksi membuka aplikasi lain).",
          );
        }
      }, 200);
    };

    const onWindowFocus = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);

    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [isExamActive, isLocked, triggerViolation]);

  return {
    violationCount,
    isLocked,
    lastWarning,
    triggerViolation,
  };
}
