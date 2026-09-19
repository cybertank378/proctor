//Files: src/sections/exam-session/organisms/ExamView.tsx
"use client";

import type React from "react";
import {ExamIntegrityMonitor} from "@/sections/exam-session/molecules/ExamIntegrityMonitor";
import {ExamLockedOverlay} from "@/sections/exam-session/molecules/ExamLockedOverlay";

interface ExamViewProps {
  readonly embedUrl: string;
  readonly isLocked: boolean;
  readonly attemptId?: number;
  readonly violationCount: number;
  readonly maxViolations: number;
  readonly lastWarning: string | null;
  readonly isCameraReady: boolean;
  readonly isCheckingStatus: boolean;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
  readonly onRefreshStatus: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  embedUrl,
  isLocked,
  attemptId,
  violationCount,
  maxViolations,
  lastWarning,
  isCameraReady,
  isCheckingStatus,
  videoRef,
  canvasRef,
  onRefreshStatus,
}) => {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Mini HUD Monitor */}
      <ExamIntegrityMonitor
        videoRef={videoRef}
        canvasRef={canvasRef}
        violationCount={violationCount}
        maxViolations={maxViolations}
        lastWarning={lastWarning}
        isCameraReady={isCameraReady}
      />

      {/* Frame Moodle */}
      <div className="relative h-screen w-screen overflow-hidden bg-slate-100">
        <iframe
          src={embedUrl}
          title="Lembar Ujian Moodle"
          className={`h-full w-full border-none transition-all duration-300 ${
            isLocked ? "pointer-events-none blur-sm select-none" : ""
          }`}
          allow="camera; microphone; display-capture; fullscreen"
          sandbox="allow-forms allow-modals allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>

      {/* Modal Kunci Otomatis */}
      <ExamLockedOverlay
        isOpen={isLocked}
        attemptId={attemptId}
        violationCount={violationCount}
        onCheckStatus={onRefreshStatus}
        isChecking={isCheckingStatus}
      />
    </main>
  );
};
