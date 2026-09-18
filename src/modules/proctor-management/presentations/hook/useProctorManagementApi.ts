//Files: src/modules/proctor-management/presentations/hook/useProctorManagementApi.ts
"use client";

import {useCallback, useMemo, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/shared-ui/component/Toast";
import type {AssignProctorRoomRequestDto, CreateProctorRequestDto} from "../../domain/dto/ProctorManagementRequestDto";
import type {ProctorSummaryResponseDto} from "../../domain/dto/ProctorManagementResponseDto";
import {ProctorManagementPresentationMapper} from "../mapper/ProctorManagementPresentationMapper";

interface ApiResponse<T> {
    readonly success: boolean;
    readonly message?: string;
    readonly data?: T;
    readonly error?: string;
}

export function useProctorManagementApi() {
    const [proctors, setProctors] = useState<readonly ProctorSummaryResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const selectOptions = useMemo(() => {
        return ProctorManagementPresentationMapper.toSelectOptions(proctors);
    }, [proctors]);

    const fetchProctors = useCallback(async (roomNumber?: string): Promise<void> => {
        setLoading(true);
        try {
            const url = new URL("/api/proctors", window.location.origin);
            if (roomNumber && roomNumber.trim().length > 0) {
                url.searchParams.set("roomNumber", roomNumber.trim());
            }

            const res = await fetch(url.toString());
            const json: ApiResponse<readonly ProctorSummaryResponseDto[]> = await res.json();
            if (res.ok && json.success && json.data) {
                setProctors(json.data);
            }
        } catch {
            showErrorToast("Gagal memuat daftar pengawas ujian.");
        } finally {
            setLoading(false);
        }
    }, []);

    const syncFromMoodle = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        try {
            const res = await fetch("/api/proctors/sync-moodle", { method: "POST" });
            const json: ApiResponse<readonly ProctorSummaryResponseDto[]> = await res.json();

            if (res.ok && json.success && json.data) {
                setProctors(json.data);
                showSuccessToast(json.message || "Sinkronisasi guru Moodle berhasil.");
                return true;
            }
            showErrorToast(json.error || json.message || "Gagal sinkronisasi dari Moodle.");
            return false;
        } catch {
            showErrorToast("Kesalahan koneksi saat menghubungi server Moodle.");
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const assignProctor = useCallback(async (payload: AssignProctorRoomRequestDto): Promise<boolean> => {
        setLoading(true);
        try {
            const res = await fetch("/api/proctors/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json: ApiResponse<ProctorSummaryResponseDto> = await res.json();

            if (res.ok && json.success) {
                showSuccessToast(json.message || "Ruangan pengawas berhasil diperbarui.");
                return true;
            }
            showErrorToast(json.error || json.message || "Gagal menugaskan ruangan.");
            return false;
        } catch {
            showErrorToast("Kesalahan koneksi saat menugaskan ruangan.");
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const createProctor = useCallback(async (payload: CreateProctorRequestDto): Promise<boolean> => {
        setLoading(true);
        try {
            const res = await fetch("/api/proctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json: ApiResponse<ProctorSummaryResponseDto> = await res.json();

            if (res.ok && json.success) {
                showSuccessToast(json.message || "Akun pengawas berhasil dibuat.");
                return true;
            }
            showErrorToast(json.error || json.message || "Gagal membuat akun pengawas.");
            return false;
        } catch {
            showErrorToast("Kesalahan koneksi saat membuat akun pengawas.");
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        proctors,
        selectOptions,
        loading,
        fetchProctors,
        syncFromMoodle,
        assignProctor,
        createProctor,
    };
}