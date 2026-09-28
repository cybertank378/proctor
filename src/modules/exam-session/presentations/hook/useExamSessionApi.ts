// Files: src/modules/exam-session/presentations/hook/useExamSessionApi.ts
"use client";

import { useCallback, useState } from "react";
import { showErrorToast } from "@/shared-ui/component/Toast";
import type { RecordViolationRequestDto } from "../../domain/dto/ExamSessionRequestDto";
import type {
  ExamSessionStatusDto,
  RecordViolationResultDto,
} from "../../domain/dto/ExamSessionResponseDto";

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly error?: string;
}

export function useExamSessionApi() {
  const [sessionData, setSessionData] = useState<ExamSessionStatusDto | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSessionStatus = useCallback(
    async (
      quizId: number,
      attemptId?: number,
      cmid?: number,
      userId?: number,
      signature?: string,
    ): Promise<ExamSessionStatusDto | null> => {
      setLoading(true);
      try {
        const url = new URL("/api/exam/session", window.location.origin);
        url.searchParams.set("quizId", String(quizId));
        if (attemptId) {
          url.searchParams.set("attemptId", String(attemptId));
        }
        if (cmid) {
          url.searchParams.set("cmid", String(cmid));
        }
        if (userId) {
          url.searchParams.set("userId", String(userId));
        }
        if (signature) {
          url.searchParams.set("signature", signature);
        }

        const res = await fetch(url.toString());
        const json: ApiResponse<ExamSessionStatusDto> = await res.json();

        if (res.ok && json.success && json.data) {
          setSessionData(json.data);
          return json.data;
        }

        showErrorToast(
          json.message || json.error || "Gagal memverifikasi status ujian.",
        );
        return null;
      } catch {
        showErrorToast(
          "Kesalahan jaringan saat memverifikasi sesi ujian siswa.",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const recordViolation = useCallback(
    async (
      payload: RecordViolationRequestDto,
    ): Promise<RecordViolationResultDto | null> => {
      try {
        const res = await fetch("/api/violations/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json: ApiResponse<RecordViolationResultDto> = await res.json();

        if (res.ok && json.success && json.data) {
          if (json.data.isLocked) {
            showErrorToast(
              "Ujian terkunci karena melebihi toleransi pelanggaran!",
            );
          }
          return json.data;
        }

        return null;
      } catch {
        return null;
      }
    },
    [],
  );

  return {
    sessionData,
    loading,
    fetchSessionStatus,
    recordViolation,
  };
}
