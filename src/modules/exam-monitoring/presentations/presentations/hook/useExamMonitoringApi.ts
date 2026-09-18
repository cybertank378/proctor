//Files: src/modules/exam-monitoring/presentations/presentations/hook/useExamMonitoringApi.ts
"use client";

import {useCallback, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/shared-ui/component/Toast";
import {ExamAttemptSummaryDto} from "@/modules/exam-monitoring/domain/dto/MonitoringResponseDto";

interface ApiResponse<T> {
    readonly success: boolean;
    readonly message?: string;
    readonly data?: T;
    readonly error?: string;
}

export function useExamMonitoringApi() {
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState<readonly ExamAttemptSummaryDto[]>([]);

    const fetchAttempts = useCallback(async (quizId?: number, roomNumber?: string) => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem("proctor_access_token");
            const url = new URL("/api/monitoring/attempts", window.location.origin);
            if (quizId) url.searchParams.set("quizId", String(quizId));
            if (roomNumber) url.searchParams.set("roomNumber", roomNumber);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json: ApiResponse<readonly ExamAttemptSummaryDto[]> = await res.json();

            if (res.ok && json.success && json.data) {
                setAttempts(json.data);
            } else {
                showErrorToast(json.message || json.error || "Gagal memuat status ujian siswa.");
            }
        } catch {
            showErrorToast("Gagal terhubung ke pemantau pengerjaan kuis.");
        } finally {
            setLoading(false);
        }
    }, []);

    const unlockStudent = useCallback(
        async (attemptId: number, reason?: string): Promise<boolean> => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem("proctor_access_token");
                const res = await fetch("/api/monitoring/attempts/unlock", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ attemptId, reason }),
                });

                const json: ApiResponse<unknown> = await res.json();
                if (res.ok && json.success) {
                    showSuccessToast("Kunci attempt ujian siswa berhasil dibuka.");
                    return true;
                }

                showErrorToast(json.error || json.message || "Gagal membuka kunci attempt.");
                return false;
            } catch {
                showErrorToast("Kesalahan jaringan saat melakukan unlock remote Moodle.");
                return false;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        loading,
        attempts,
        fetchAttempts,
        unlockStudent,
    };
}