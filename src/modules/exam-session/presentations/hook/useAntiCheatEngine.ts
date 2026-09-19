// Files: src/modules/exam-session/presentations/hook/useAntiCheatEngine.ts
"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import type {ViolationType} from "@/generated/prisma/enums";

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
  const [violationCount, setViolationCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fungsi penangkapan snapshot visual kamera
  const captureSnapshot = useCallback((): string => {
    const canvas = canvasRef.current || document.createElement("canvas");
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    const width = video && video.videoWidth > 0 ? video.videoWidth : 320;
    const height = video && video.videoHeight > 0 ? video.videoHeight : 240;

    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        // Balik horizontal (mirror) agar sesuai dengan tampilan monitor siswa
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();

        // Sematkan watermark timestamp audit
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, height - 24, width, 24);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(
          `AUDIT BUKTI: ${new Date().toLocaleTimeString("id-ID")}`,
          8,
          height - 8,
        );
      } else {
        // Gambar placeholder visual jika frame video belum siap (tidak transparan)
        ctx.fillStyle = "#0f172a"; // Slate 900
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#ef4444"; // Red 500
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 15, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "KAMERA TIDAK AKTIF / DITUTUP",
          width / 2,
          height / 2 + 25,
        );
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(
          new Date().toLocaleString("id-ID"),
          width / 2,
          height / 2 + 45,
        );
      }

      return canvas.toDataURL("image/png");
    }

    return "";
  }, []);

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
