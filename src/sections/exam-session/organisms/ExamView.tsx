// Files: src/sections/exam-session/organisms/ExamView.tsx
"use client";

import type React from "react";
import type Webcam from "react-webcam";
import {CameraFeed} from "../atoms/CameraFeed";
import {ExamLockedOverlay} from "../molecules/ExamLockedOverlay";

export interface ExamViewProps {
  readonly embedUrl: string;
  readonly isLocked: boolean;
  readonly attemptId?: number;
  readonly violationCount: number;
  readonly maxViolations: number;
  readonly lastWarning: string | null;
  readonly isCameraReady: boolean;
  readonly isCheckingStatus: boolean;
  readonly webcamRef: React.RefObject<Webcam | null>;
  readonly onRefreshStatus: () => void;
  readonly onCameraReady?: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  embedUrl,
  isLocked,
  violationCount,
  maxViolations,
  lastWarning,
  isCameraReady,
  isCheckingStatus,
  webcamRef,
  onRefreshStatus,
  onCameraReady,
}) => {
  return (
    <main className="relative flex h-screen w-screen overflow-hidden bg-slate-950 select-none">
      {/* Container Iframe Lembar Ujian Moodle */}
      <div className="relative h-full w-full flex-1">
        <iframe
          src={embedUrl}
          title="Lembar Ujian Moodle"
          className="h-full w-full border-0 bg-white"
          allow="camera; microphone; display-capture; fullscreen"
        />
      </div>

      {/* Floating Picture-in-Picture Kamera Siswa */}
      <aside className="fixed bottom-4 right-4 z-40 w-48 shadow-2xl transition-all sm:w-56">
        <CameraFeed
          webcamRef={webcamRef}
          isReady={isCameraReady}
          onUserMedia={onCameraReady}
        />
        {lastWarning && (
          <div className="mt-1 rounded-md bg-amber-500/90 px-2 py-1 text-center text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs">
            {lastWarning}
          </div>
        )}
      </aside>

      {/* Overlay Layar Kunci saat Melanggar */}
      {isLocked && (
        <ExamLockedOverlay
          violationCount={violationCount}
          maxAllowedViolations={maxViolations}
          isChecking={isCheckingStatus}
          onCheckUnlock={onRefreshStatus}
        />
      )}
    </main>
  );
};
