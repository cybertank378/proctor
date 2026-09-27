// Files: src/modules/exam-session/presentations/hook/useAntiCheatEngine.ts
"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";
import type { ViolationType } from "@/generated/prisma/enums";

interface UseAntiCheatOptions {
  readonly quizId: number;
  readonly attemptId?: number;
  readonly studentIdentifier?: string;
  readonly isExamActive: boolean;
  readonly maxTolerance?: number;
  readonly webcamRef?: React.RefObject<Webcam | null>;
  readonly screenStreamRef?: React.RefObject<MediaStream | null>;
}

export function useAntiCheatEngine({
  quizId,
  attemptId,
  studentIdentifier = "Siswa",
  isExamActive,
  maxTolerance = 3,
  webcamRef,
  screenStreamRef,
}: UseAntiCheatOptions) {
  const [violationCount, setViolationCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  // Buffer untuk menyimpan frame aktif terakhir sebelum tab diminimalkan
  const lastActiveSnapshotRef = useRef<string | null>(null);
  const hiddenScreenVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined" && !hiddenScreenVideoRef.current) {
      const videoEl = document.createElement("video");
      videoEl.autoplay = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      hiddenScreenVideoRef.current = videoEl;
    }
  }, []);

  // Update buffer frame terakhir setiap 500ms saat ujian aktif dan jendela masih terlihat
  useEffect(() => {
    if (!isExamActive || isLocked) return;

    const interval = setInterval(() => {
      if (!document.hidden && webcamRef?.current) {
        try {
          const frame = webcamRef.current.getScreenshot({
            width: 640,
            height: 480,
          });
          if (frame && frame.length > 100) {
            lastActiveSnapshotRef.current = frame;
          }
        } catch {
          // Abaikan kesalahan silent polling
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isExamActive, isLocked, webcamRef]);

  // Tangkap snapshot webcam siswa
  const captureWebcamSnapshot = useCallback((): string => {
    try {
      // Jika tab tersembunyi (diminimalkan/pindah tab), browser akan freeze kamera dan me-return frame hitam.
      // Langsung gunakan buffer terakhir yang valid.
      if (typeof document !== "undefined" && document.hidden && lastActiveSnapshotRef.current) {
        return lastActiveSnapshotRef.current;
      }

      if (webcamRef?.current) {
        const imageSrc = webcamRef.current.getScreenshot({
          width: 640,
          height: 480,
        });

        if (imageSrc && imageSrc.length > 100) {
          return imageSrc;
        }
      }
    } catch (err) {
      console.warn("[ANTI-CHEAT] Gagal mengambil snapshot real-time:", err);
    }

    // Ambil dari buffer frame terakhir jika pemanggilan real-time dibekukan browser
    if (lastActiveSnapshotRef.current) {
      return lastActiveSnapshotRef.current;
    }

    return "";
  }, [webcamRef]);

  // Tangkap snapshot tampilan layar/tab (jika screen stream aktif)
  const captureScreenSnapshot = useCallback((): string => {
    try {
      const stream = screenStreamRef?.current;
      if (!stream) return "";

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState !== "live") return "";

      const video = hiddenScreenVideoRef.current;
      if (!video) return "";

      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = document.createElement("canvas");
        
        // Downscale ke maksimal 1280x720 untuk menghemat ukuran base64 payload
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          return canvas.toDataURL("image/jpeg", 0.5); // Gunakan JPEG 50%
        }
      }
    } catch (err) {
      console.warn(
        "[ANTI-CHEAT] Gagal mengambil screenshot layar tujuan:",
        err,
      );
    }

    return "";
  }, [screenStreamRef]);

  // Ekstraksi bukti visual utama
  const captureSnapshot = useCallback((): string => {
    // 1. Coba tangkap layar tujuan
    const screenImg = captureScreenSnapshot();
    if (screenImg) return screenImg;

    // 2. Ambil snapshot webcam langsung atau dari buffer frame terakhir
    const webcamImg = captureWebcamSnapshot();
    if (webcamImg) return webcamImg;

    // 3. Fallback Canvas informatif dengan visual jelas jika webcam mati
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
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FRAME KAMERA / LAYAR TIDAK AKTIF", 320, 270);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(new Date().toLocaleString("id-ID"), 320, 295);
      return canvas.toDataURL("image/png");
    }

    return "";
  }, [captureScreenSnapshot, captureWebcamSnapshot]);

  // Push frame ke API Stream tiap 10 detik
  useEffect(() => {
    if (!isExamActive || isLocked || !attemptId) return;

    const interval = setInterval(() => {
      if (document.hidden) return; // Jangan push black frame jika minimize

      const screenshot = captureSnapshot();
      if (!screenshot) return;

      const payload = {
        quizId: Number(quizId),
        attemptId: attemptId ? Number(attemptId) : undefined, 
        userId: Number(studentIdentifier),
        screenshotBase64: screenshot,
      };

      fetch("/api/proctoring/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn("[ANTI-CHEAT] Gagal upload frame stream:", err);
      });
    }, 10000); // 10 detik

    return () => clearInterval(interval);
  }, [isExamActive, isLocked, attemptId, quizId, studentIdentifier, captureSnapshot]);

  const triggerViolation = useCallback(
    async (type: ViolationType, reason: string, preCapturedSnapshot?: string) => {
      if (isLocked) return;

      const screenshot = preCapturedSnapshot || captureSnapshot();
      setLastWarning(reason);

      const payload = {
        quizId: Number(quizId),
        attemptId: attemptId ? Number(attemptId) : undefined,
        studentIdentifier,
        violationType: type,
        reason,
        timestamp: new Date().toISOString(),
        screenshotBase64: screenshot,
        metadata: {
          url: typeof window !== "undefined" ? window.location.href : "",
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "",
          screenWidth: typeof window !== "undefined" ? window.innerWidth : 0,
          screenHeight: typeof window !== "undefined" ? window.innerHeight : 0,
          visibilityState:
            typeof document !== "undefined"
              ? document.visibilityState
              : "unknown",
          hasFocus:
            typeof document !== "undefined" ? document.hasFocus() : false,
        },
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
        // Tangkap sesegera mungkin saat event pindah tab terdeteksi
        const immediateSnapshot = captureSnapshot();
        void triggerViolation(
          "TAB_SWITCH" as ViolationType,
          "Siswa terdeteksi beralih tab atau meminimalkan browser ujian.",
          immediateSnapshot
        );
      }
    };

    const onWindowBlur = () => {
      // Tangkap bukti segera sebelum browser sempat menidurkan (freeze) thread atau rendering
      const immediateSnapshot = captureSnapshot();
      
      if (blurTimeout) clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        // Abaikan jika fokus berpindah ke dalam iframe kuis Moodle
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
            immediateSnapshot // <-- Kirim bukti yang sudah kita tangkap 3 detik lalu
          );
        }
      }, 5000);
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
