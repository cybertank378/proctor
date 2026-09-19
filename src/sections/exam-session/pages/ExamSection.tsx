//Files: src/sections/exam-session/pages/ExamSection.tsx
"use client";

import type React from "react";
import {useEffect, useState} from "react";
import {useAntiCheatEngine} from "@/modules/exam-session/presentations/hook/useAntiCheatEngine";
import {useExamSessionApi} from "@/modules/exam-session/presentations/hook/useExamSessionApi";
import {ExamGateView} from "@/sections/exam-session/molecules/ExamGateView";
import {ExamView} from "../organisms/ExamView";

interface ExamSectionProps {
  readonly quizId: number;
}

export const ExamSection: React.FC<ExamSectionProps> = ({ quizId }) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);

  const {
    sessionData,
    loading: isCheckingStatus,
    fetchSessionStatus,
  } = useExamSessionApi();

  const {
    videoRef,
    canvasRef,
    violationCount,
    isLocked: engineLocked,
    lastWarning,
  } = useAntiCheatEngine({
    quizId,
    attemptId: sessionData?.attemptId,
    isExamActive: isExamStarted,
    maxTolerance: sessionData?.maxAllowedViolations ?? 3,
  });

  const isCurrentlyLocked = engineLocked || Boolean(sessionData?.isLocked);

  useEffect(() => {
    if (quizId > 0) {
      void fetchSessionStatus(quizId);
    }
  }, [quizId, fetchSessionStatus]);

  const handleRequestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch {
      setHasPermission(false);
    }
  };

  const handleRefreshStatus = () => {
    void fetchSessionStatus(quizId, sessionData?.attemptId);
  };

  if (!isExamStarted) {
    return (
      <ExamGateView
        quizId={quizId}
        hasPermission={hasPermission}
        onRequestCamera={() => void handleRequestCamera()}
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
      isCameraReady={hasPermission}
      isCheckingStatus={isCheckingStatus}
      videoRef={videoRef}
      canvasRef={canvasRef}
      onRefreshStatus={handleRefreshStatus}
    />
  );
};
