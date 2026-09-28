// Files: src/sections/exam-session/molecules/ExamLockedOverlay.tsx
"use client";

import { Lock, RefreshCw, ShieldOff } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import Button from "@/shared-ui/component/Button";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

export interface ExamLockedOverlayProps {
  readonly violationCount: number;
  readonly maxAllowedViolations: number;
  readonly isChecking: boolean;
  readonly onCheckUnlock: () => void;
  readonly attemptId?: number;
}

export const ExamLockedOverlay: React.FC<ExamLockedOverlayProps> = ({
  violationCount,
  maxAllowedViolations,
  isChecking,
  onCheckUnlock,
  attemptId,
}) => {
  const [pin, setPin] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    console.warn(
      `%c[EXAM-LOCKED-OVERLAY ACTIVE] 🔒 Layar siswa diblokir oleh overlay penguncian!\n` +
        `Attempt ID: ${attemptId ?? "None"} | Pelanggaran: ${violationCount}/${maxAllowedViolations}\n` +
        `Siswa harus meminta Pengawas Ruang untuk membuka kunci ujian via PIN atau Remote.`,
      "color: #dc2626; font-size: 14px; font-weight: bold;"
    );
  }, [attemptId, violationCount, maxAllowedViolations]);

  const handleUnlockWithPin = async () => {
    if (!pin || pin.length < 4) return;
    setIsUnlocking(true);
    console.info(`[EXAM-LOCKED-OVERLAY] Mencoba membuka kunci dengan PIN untuk Attempt #${attemptId}...`);
    try {
      const res = await fetch("/api/exam-session/unlock-with-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        console.warn(`[EXAM-LOCKED-OVERLAY] Gagal buka kunci:`, data);
        showErrorToast(data.message || "PIN salah atau sesi tidak dapat dibuka.");
      } else {
        console.info(`[EXAM-LOCKED-OVERLAY] Berhasil buka kunci!`, data);
        showSuccessToast("Kunci ujian berhasil dibuka!");
        onCheckUnlock(); // Refresh status setelah berhasil
      }
    } catch (err) {
      console.error(`[EXAM-LOCKED-OVERLAY] Kesalahan jaringan saat buka kunci:`, err);
      showErrorToast("Terjadi kesalahan jaringan.");
    } finally {
      setIsUnlocking(false);
      setPin("");
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="grid w-full max-w-md grid-cols-1 gap-5 rounded-2xl border border-red-200 bg-white p-6 text-center shadow-2xl">
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
              {violationCount} dari maksimal {maxAllowedViolations} pelanggaran
            </span>
            . Silakan hubungi pengawas ruangan untuk membuka akses.
          </p>
        </div>
        {attemptId && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 font-mono text-xs text-slate-500">
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
            onClick={onCheckUnlock}
            className="h-10 w-full text-xs font-semibold"
          >
            Cek Status Buka Kunci (Remote)
          </Button>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-[11px] text-slate-500 font-medium">
              Buka Manual oleh Pengawas (On-Site):
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="PIN Pengawas"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <Button
                type="button"
                color="secondary"
                variant="filled"
                loading={isUnlocking}
                onClick={handleUnlockWithPin}
                className="h-10 px-4 text-xs font-semibold"
              >
                Buka
              </Button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldOff className="size-3.5" />
            <span>Anti-Cheat Guard Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
