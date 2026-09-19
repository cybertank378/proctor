// Files: src/sections/exam-session/organisms/ExamIntegrityMonitor.tsx
"use client";

import type React from "react";
import type Webcam from "react-webcam";
import {IntegrityBadge} from "@/sections/exam-session/atoms/IntegrityBadge";
import {CameraFeed} from "../atoms/CameraFeed";

interface ExamIntegrityMonitorProps {
  readonly webcamRef: React.RefObject<Webcam | null>;
  readonly violationCount: number;
  readonly maxViolations: number;
  readonly lastWarning: string | null;
  readonly isCameraReady: boolean;
  readonly onCameraReady?: () => void;
}

export const ExamIntegrityMonitor: React.FC<ExamIntegrityMonitorProps> = ({
  webcamRef,
  violationCount,
  maxViolations,
  lastWarning,
  isCameraReady,
  onCameraReady,
}) => (
  <aside className="fixed top-4 right-4 z-40 flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-md w-64">
    <IntegrityBadge
      violationCount={violationCount}
      maxViolations={maxViolations}
    />
    <CameraFeed
      webcamRef={webcamRef}
      isReady={isCameraReady}
      onUserMedia={onCameraReady}
    />
    {lastWarning && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] font-medium text-red-700 leading-tight">
        ⚠️ {lastWarning}
      </div>
    )}
  </aside>
);
