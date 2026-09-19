// Files: src/sections/exam/atoms/CameraFeed.tsx
"use client";

import {Camera} from "lucide-react";
import type React from "react";

interface CameraFeedProps {
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly isReady: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  videoRef,
  isReady,
}) => (
  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-200">
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      onLoadedMetadata={(e) => {
        void (e.target as HTMLVideoElement).play();
      }}
      className={`h-full w-full object-cover ${!isReady ? "hidden" : "block"}`}
      style={{ transform: "scaleX(-1)" }}
    />
    {!isReady && (
      <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-[11px] text-slate-400">
        <Camera className="size-5 mb-1 text-slate-500 animate-pulse" />
        Menghubungkan kamera...
      </div>
    )}
    <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
      <span className="size-2 rounded-full bg-red-500 animate-ping" />
      <span className="text-[10px] font-semibold text-white/90 drop-shadow">
        REC
      </span>
    </div>
  </div>
);
