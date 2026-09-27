// src/sections/exam-monitoring/organisms/ExamSessionSelectorModal.tsx
"use client";

import {BookOpen, Clock, Users, X} from "lucide-react";
import type React from "react";
import {useEffect} from "react";
import type {MoodleActiveQuizItem} from "@/shared/contract/MoodleRpcClientContract";
import Button from "@/shared-ui/component/Button";
import {Modal} from "@/shared-ui/component/Modal";

interface ExamSessionSelectorModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly availableQuizzes: readonly MoodleActiveQuizItem[];
  readonly isLoading: boolean;
  readonly onSelectQuiz: (quizId: number) => void;
  readonly onFetch: () => void;
}

export const ExamSessionSelectorModal: React.FC<ExamSessionSelectorModalProps> = ({
  isOpen,
  onClose,
  availableQuizzes,
  isLoading,
  onSelectQuiz,
  onFetch,
}) => {
  useEffect(() => {
    if (isOpen) {
      onFetch();
    }
  }, [isOpen, onFetch]);

  const formatTimestamp = (ts: number) => {
    if (ts === 0) return "Tidak Terbatas";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts * 1000));
  };

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose} 
      size="xl"
      title="Pilih Sesi Ujian Aktif"
      subtitle="Pilih salah satu sesi ujian dari Moodle yang ingin Anda pantau."
    >
      <div className="p-4 sm:p-6 bg-slate-50 min-h-[300px] -mx-8 -mb-8 rounded-b-2xl border-t border-slate-100">
        {isLoading ? (
          <div className="flex flex-col h-full items-center justify-center p-8 text-slate-500">
            <span className="animate-pulse size-10 rounded-full bg-slate-200 mb-3" />
            <p className="text-sm font-medium">Memuat data ujian dari Moodle...</p>
          </div>
        ) : availableQuizzes.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center p-8 text-slate-500 text-center">
            <BookOpen className="size-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Ujian Aktif</p>
            <p className="text-xs text-slate-500 mt-1">Saat ini tidak ada sesi ujian yang berjalan atau dapat diakses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableQuizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 hover:ring-1 hover:ring-indigo-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  onSelectQuiz(quiz.quizId);
                  onClose();
                }}
              >
                <div className="p-4 border-b border-slate-100 bg-indigo-50/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2" title={quiz.quizName}>
                        {quiz.quizName}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium line-clamp-1" title={quiz.courseName}>
                        Matpel: {quiz.courseName}
                      </p>
                    </div>
                    <span className="shrink-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-200 ml-2">
                      #{quiz.quizId}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="grid grid-cols-1 gap-2 text-[11px]">
                    <div className="flex items-center text-slate-600 gap-1.5">
                      <Clock className="size-3.5 shrink-0 text-slate-400" />
                      <div>
                        <span className="font-semibold block">Waktu Buka:</span>
                        <span>{formatTimestamp(quiz.timeOpen)}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-slate-600 gap-1.5">
                      <Clock className="size-3.5 shrink-0 text-slate-400" />
                      <div>
                        <span className="font-semibold block">Waktu Tutup:</span>
                        <span>{formatTimestamp(quiz.timeClose)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    color="primary"
                    variant="filled"
                    size="sm"
                    className="w-full h-8 text-[11px] mt-2"
                  >
                    Pilih Sesi Ujian
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
