// Files: src/sections/exam-session/pages/ExamSection.tsx
"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";
import { useAntiCheatEngine } from "@/modules/exam-session/presentations/hook/useAntiCheatEngine";
import { useExamSessionApi } from "@/modules/exam-session/presentations/hook/useExamSessionApi";
import { ExamGateView } from "@/sections/exam-session/molecules/ExamGateView";
import { showErrorToast, showWarningToast } from "@/shared-ui/component/Toast";
import { ExamView } from "../organisms/ExamView";

interface ExamSectionProps {
  readonly quizId: number;
  readonly userId?: number;
  readonly attemptId?: number;
}

export const ExamSection: React.FC<ExamSectionProps> = ({
  quizId,
  userId,
  attemptId: initialAttemptId,
}) => {
  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean>(false);
  const [hasScreenPermission, setHasScreenPermission] =
    useState<boolean>(false);
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);

  // Instansiasi tunggal react-webcam ref
  const webcamRef = useRef<Webcam | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const {
    sessionData,
    loading: isCheckingStatus,
    fetchSessionStatus,
  } = useExamSessionApi();

  const {
    violationCount,
    isLocked: engineLocked,
    lastWarning,
  } = useAntiCheatEngine({
    quizId,
    attemptId: sessionData?.attemptId ?? initialAttemptId,
    studentIdentifier: userId ? String(userId) : "Siswa",
    isExamActive: isExamStarted,
    maxTolerance: sessionData?.maxAllowedViolations ?? 3,
    webcamRef,
    screenStreamRef,
  });

  const isCurrentlyLocked = engineLocked || Boolean(sessionData?.isLocked);

  useEffect(() => {
    if (quizId > 0) {
      void fetchSessionStatus(quizId);
    }
  }, [quizId, fetchSessionStatus]);

  const handleRefreshStatus = () => {
    void fetchSessionStatus(quizId, sessionData?.attemptId);
  };

  const handleRequestScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: false,
      });
      screenStreamRef.current = stream;

      // Jika stream dihentikan oleh user (misal klik 'Stop sharing')
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setHasScreenPermission(false);
        setIsExamStarted(false);
        showWarningToast(
          "Sesi ujian dihentikan sementara karena Anda menghentikan pembagian layar. Silakan izinkan kembali untuk melanjutkan.",
        );
      });

      setHasScreenPermission(true);
    } catch (err) {
      console.warn("User menolak izin berbagi layar:", err);
      showErrorToast(
        "Akses perekaman layar ditolak. Anda wajib membagikan layar untuk dapat memulai atau melanjutkan ujian.",
      );
    }
  };

  if (!isExamStarted) {
    return (
      <ExamGateView
        quizId={quizId}
        hasCameraPermission={hasCameraPermission}
        hasScreenPermission={hasScreenPermission}
        onRequestCamera={() => setHasCameraPermission(true)}
        onRequestScreen={handleRequestScreen}
        onStartExam={() => setIsExamStarted(true)}
      />
    );
  }

  const fallbackEmbedUrl = `https://ujian.smpn29jkt.sch.id/mod/quiz/view.php?id=${quizId}&guard_runner=1`;
  const embedUrl = sessionData?.moodleEmbedUrl
    ? sessionData.moodleEmbedUrl.includes("?")
      ? `${sessionData.moodleEmbedUrl}&guard_runner=1`
      : `${sessionData.moodleEmbedUrl}?guard_runner=1`
    : fallbackEmbedUrl;

  return (
    <ExamView
      embedUrl={embedUrl}
      isLocked={isCurrentlyLocked}
      attemptId={sessionData?.attemptId ?? initialAttemptId}
      violationCount={violationCount}
      maxViolations={sessionData?.maxAllowedViolations ?? 3}
      lastWarning={lastWarning}
      isCameraReady={hasCameraPermission}
      isCheckingStatus={isCheckingStatus}
      webcamRef={webcamRef}
      onRefreshStatus={handleRefreshStatus}
      onCameraReady={() => setHasCameraPermission(true)}
    />
  );
};
