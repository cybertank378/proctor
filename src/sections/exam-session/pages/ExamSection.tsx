// Files: src/sections/exam-session/pages/ExamSection.tsx
"use client";

import type React from "react";
import {useEffect, useRef, useState} from "react";
import type Webcam from "react-webcam";
import {useAntiCheatEngine} from "@/modules/exam-session/presentations/hook/useAntiCheatEngine";
import {useExamSessionApi} from "@/modules/exam-session/presentations/hook/useExamSessionApi";
import {ExamGateView} from "@/sections/exam-session/molecules/ExamGateView";
import {ExamView} from "../organisms/ExamView";

interface ExamSectionProps {
  readonly quizId: number;
}

export const ExamSection: React.FC<ExamSectionProps> = ({ quizId }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [hasScreenPermission, setHasScreenPermission] = useState<boolean>(false);
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
    attemptId: sessionData?.attemptId,
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
        alert("Sesi ujian dihentikan sementara karena Anda menghentikan pembagian layar. Silakan izinkan kembali untuk melanjutkan.");
      });

      setHasScreenPermission(true);
    } catch (err) {
      console.warn("User menolak izin berbagi layar:", err);
      alert("Akses perekaman layar ditolak. Anda wajib membagikan layar untuk dapat memulai atau melanjutkan ujian.");
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

  return (
    <ExamView
      embedUrl={
        sessionData?.moodleEmbedUrl ??
        `https://ujian.smpn29jkt.sch.id/mod/quiz/view.php?id=${quizId}`
      }
      isLocked={isCurrentlyLocked}
      attemptId={sessionData?.attemptId}
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
