//Files: src/sections/exam-session/organisms/ExamGateView.tsx
"use client";

import {Camera, CheckCircle2} from "lucide-react";
import type React from "react";
import {PreExamCheckItem} from "@/sections/exam-session/atoms/PreExamCheckItem";
import Button from "@/shared-ui/component/Button";

interface ExamGateViewProps {
  readonly quizId: number;
  readonly hasPermission: boolean;
  readonly onRequestCamera: () => void;
  readonly onStartExam: () => void;
}

export const ExamGateView: React.FC<ExamGateViewProps> = ({
  quizId,
  hasPermission,
  onRequestCamera,
  onStartExam,
}) => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
    <div className="grid w-full max-w-lg grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="border-b border-slate-100 pb-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Gerbang Pemeriksaan Ujian
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Kuis ID #{quizId} • Safe Exam Browser
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs">
        <PreExamCheckItem
          icon={CheckCircle2}
          title="Pengawasan Integritas Otomatis"
          description="Dilarang beralih tab, minimize jendela, atau membuka aplikasi lain."
        />
        <PreExamCheckItem
          icon={Camera}
          title="Izin Akses Kamera"
          description="Kamera wajib aktif menghadap wajah siswa selama ujian berlangsung."
        />
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-2">
        {!hasPermission ? (
          <Button
            type="button"
            color="primary"
            variant="filled"
            leftIcon={Camera}
            onClick={onRequestCamera}
            className="h-11 w-full text-xs font-semibold"
          >
            Izinkan & Aktifkan Kamera
          </Button>
        ) : (
          <Button
            type="button"
            color="success"
            variant="filled"
            leftIcon={CheckCircle2}
            onClick={onStartExam}
            className="h-11 w-full text-xs font-semibold"
          >
            Mulai Masuk ke Lembar Ujian
          </Button>
        )}
      </div>
    </div>
  </main>
);
