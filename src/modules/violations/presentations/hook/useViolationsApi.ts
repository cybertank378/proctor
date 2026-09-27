//Files: src/modules/violations/presentations/hook/useViolationsApi.ts
"use client";

import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import type { RecordViolationRequestDto } from "../../domain/dto/ViolationRequestDto";
import type {
  VerifyIntegrityResultDto,
  ViolationSummaryDto,
} from "../../domain/dto/ViolationResponseDto";

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly error?: string;
}

export function useViolationsApi() {
  const [loading, setLoading] = useState(false);
  const [violations, setViolations] = useState<readonly ViolationSummaryDto[]>(
    [],
  );

  const fetchViolations = useCallback(
    async (attemptRecordId: string): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/violations?attemptRecordId=${encodeURIComponent(attemptRecordId)}`,
        );
        const json: ApiResponse<readonly ViolationSummaryDto[]> =
          await res.json();

        if (res.ok && json.success && json.data) {
          setViolations(json.data);
        } else {
          showErrorToast(
            json.message ||
              json.error ||
              "Gagal memuat rekam jejak pelanggaran.",
          );
        }
      } catch {
        showErrorToast("Gagal terhubung ke server audit bukti.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reportViolation = useCallback(
    async (payload: RecordViolationRequestDto): Promise<boolean> => {
      try {
        const res = await fetch("/api/violations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json: ApiResponse<unknown> = await res.json();
        return res.ok && json.success;
      } catch {
        return false;
      }
    },
    [],
  );

  const verifyIntegrity = useCallback(
    async (violationId: string): Promise<VerifyIntegrityResultDto | null> => {
      try {
        const res = await fetch("/api/violations/verify-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ violationId }),
        });

        const json: ApiResponse<VerifyIntegrityResultDto> = await res.json();
        if (res.ok && json.success && json.data) {
          if (json.data.isAuthentic) {
            showSuccessToast(
              "File bukti terverifikasi otentik (SHA-256 Valid).",
            );
          } else {
            showErrorToast(
              "Peringatan: Checksum bukti berbeda dari rekaman asli!",
            );
          }
          return json.data;
        }

        showErrorToast(
          json.error || "Gagal memvalidasi integritas bukti snapshot.",
        );
        return null;
      } catch {
        showErrorToast("Gagal berkomunikasi dengan server verifikasi hash.");
        return null;
      }
    },
    [],
  );

  return {
    loading,
    violations,
    fetchViolations,
    reportViolation,
    verifyIntegrity,
  };
}
