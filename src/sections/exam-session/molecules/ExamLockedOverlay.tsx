//Files: src/sections/exam-session/molecules/ExamLockedOverlay.tsx
"use client";

import {Lock, RefreshCw, ShieldOff} from "lucide-react";
import type React from "react";
import Button from "@/shared-ui/component/Button";

interface ExamLockedOverlayProps {
  readonly isOpen: boolean;
  readonly attemptId?: number;
  readonly violationCount: number;
  readonly onCheckStatus: () => void;
  readonly isChecking: boolean;
}

export const ExamLockedOverlay: React.FC<ExamLockedOverlayProps> = ({
  isOpen,
  attemptId,
  violationCount,
  onCheckStatus,
  isChecking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="grid w-full max-w-md grid-cols-1 gap-5 rounded-2xl border border-red-200 bg-white p-6 shadow-2xl text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
          <Lock className="size-7 text-red-600" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900">
            Sesi Ujian Terkunci
          </h2>
          <p className="text-xs text-slate-600">
            Terdeteksi{" "}
            <span className="font-bold text-red-600">
              {violationCount} pelanggaran
            </span>
            . Silakan hubungi pengawas ruangan untuk membuka akses.
          </p>
        </div>
        {attemptId && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 font-mono">
            Attempt ID:{" "}
            <span className="font-bold text-slate-800">#{attemptId}</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 pt-2">
          <Button
            type="button"
            color="primary"
            variant="filled"
            leftIcon={RefreshCw}
            loading={isChecking}
            onClick={onCheckStatus}
            className="w-full h-10 text-xs font-semibold"
          >
            Cek Status Buka Kunci
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldOff className="size-3.5" />
            <span>Anti-Cheat Guard Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
