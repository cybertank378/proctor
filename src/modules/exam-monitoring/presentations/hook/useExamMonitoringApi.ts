// Files: src/modules/exam-monitoring/presentations/hook/useExamMonitoringApi.ts
"use client";

import { useCallback, useState } from "react";
import type {
  ActiveQuizResolutionDto,
  ExamAttemptSummaryDto,
} from "@/modules/exam-monitoring/domain/dto/MonitoringResponseDto";
import type { MoodleActiveQuizItem } from "@/shared/contract/MoodleRpcClientContract";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly error?: string;
}

export function useExamMonitoringApi() {
  const [attempts, setAttempts] = useState<readonly ExamAttemptSummaryDto[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [activeQuizInfo, setActiveQuizInfo] =
    useState<ActiveQuizResolutionDto | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<
    readonly MoodleActiveQuizItem[]
  >([]);

  const fetchActiveQuiz = useCallback(
    async (roomNumber?: string): Promise<number | null> => {
      try {
        const token = sessionStorage.getItem("proctor_access_token");
        const url = new URL(
          "/api/monitoring/active-quiz",
          window.location.origin,
        );
        if (roomNumber && roomNumber.trim().length > 0) {
          url.searchParams.set("roomNumber", roomNumber.trim());
        }

        const res = await fetch(url.toString(), {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (!res.ok) {
          setActiveQuizInfo(null);
          return null;
        }

        const json: ApiResponse<ActiveQuizResolutionDto | null> =
          await res.json();
        if (json.success && json.data?.quizId) {
          setActiveQuizInfo(json.data);
          return json.data.quizId;
        }

        setActiveQuizInfo(null);
        return null;
      } catch {
        setActiveQuizInfo(null);
        return null;
      }
    },
    [],
  );

  const fetchAvailableQuizzes = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("proctor_access_token");
      const url = new URL("/api/monitoring/sessions", window.location.origin);

      const res = await fetch(url.toString(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setAvailableQuizzes(json.data || []);
      } else {
        showErrorToast(
          json.error || json.message || "Gagal memuat daftar kuis.",
        );
      }
    } catch {
      showErrorToast("Kesalahan jaringan saat memuat daftar kuis.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttempts = useCallback(
    async (quizId?: number, roomNumber?: string): Promise<void> => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("proctor_access_token");
        const url = new URL("/api/monitoring/attempts", window.location.origin);
        if (quizId && quizId > 0) {
          url.searchParams.set("quizId", String(quizId));
        }
        if (roomNumber && roomNumber.trim().length > 0) {
          url.searchParams.set("roomNumber", roomNumber.trim());
        }

        const res = await fetch(url.toString(), {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        const json = await res.json();
        if (res.ok && json.success) {
          const resolvedList = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.data?.items)
              ? json.data.items
              : [];
          setAttempts(resolvedList);
        } else {
          showErrorToast(
            json.error || json.message || "Gagal memuat sesi ujian.",
          );
        }
      } catch {
        showErrorToast("Kesalahan jaringan saat memuat data monitoring.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const unlockStudent = useCallback(
    async (attemptId: number): Promise<boolean> => {
      try {
        const token = sessionStorage.getItem("proctor_access_token");
        const res = await fetch("/api/monitoring/unlock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ attemptId }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          showSuccessToast(json.message || "Siswa berhasil dibuka kembali.");
          return true;
        }
        showErrorToast(
          json.error || json.message || "Gagal membuka sesi ujian.",
        );
        return false;
      } catch {
        showErrorToast("Kesalahan jaringan saat membuka kunci siswa.");
        return false;
      }
    },
    [],
  );

  return {
    attempts,
    loading,
    activeQuizInfo,
    availableQuizzes,
    fetchActiveQuiz,
    fetchAvailableQuizzes,
    fetchAttempts,
    unlockStudent,
  };
}
