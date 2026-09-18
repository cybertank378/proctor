// src/modules/auth/presentations/hook/useAuthApi.ts
"use client";

import {useCallback, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/shared-ui/component/Toast";
import type {LoginRequestDto} from "../../domain/dto/AuthRequestDto";
import type {CurrentSessionResponseDto, LoginResponseDto} from "../../domain/dto/AuthResponseDto";

interface ApiResponse<T> {
    readonly success: boolean;
    readonly message?: string;
    readonly data?: T;
    readonly error?: string;
}

// Menampung fleksibilitas payload token vs accessToken dari handler
type NormalizedLoginData = LoginResponseDto & {
    readonly token?: string;
    readonly accessToken?: string;
};

export function useAuthApi() {
    const [loading, setLoading] = useState(false);

    const login = useCallback(
        async (payload: LoginRequestDto): Promise<boolean> => {
            setLoading(true);
            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const json: ApiResponse<NormalizedLoginData> = await res.json();

                if (!res.ok || !json.success || !json.data) {
                    showErrorToast(json.message || json.error || "Gagal masuk ke sistem.");
                    return false;
                }

                // Resolusi token: mendukung baik json.data.token maupun json.data.accessToken
                const resolvedToken = json.data.token || json.data.accessToken || "";

                if (!resolvedToken) {
                    showErrorToast("Token otorisasi pengawas tidak ditemukan dalam respon server.");
                    return false;
                }

                sessionStorage.setItem("proctor_access_token", resolvedToken);
                sessionStorage.setItem("proctor_user", JSON.stringify(json.data.user));

                showSuccessToast(`Selamat datang, ${json.data.user.fullName}`);

                // Gunakan hard navigation agar cookie 'proctor_access_token' terbaca langsung oleh proxy.ts
                window.location.replace("/monitoring");
                return true;
            } catch {
                showErrorToast("Koneksi gagal. Periksa jaringan Anda.");
                return false;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const logout = useCallback(async (): Promise<void> => {
        const token = sessionStorage.getItem("proctor_access_token");
        if (token) {
            try {
                await fetch("/api/auth/login", {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch {
                // Abaikan kegagalan jaringan saat logout
            }
        }

        sessionStorage.removeItem("proctor_access_token");
        sessionStorage.removeItem("proctor_user");
        window.location.replace("/login");
    }, []);

    const fetchSession = useCallback(async (): Promise<CurrentSessionResponseDto | null> => {
        const token = sessionStorage.getItem("proctor_access_token");
        if (!token) return null;

        try {
            const res = await fetch("/api/auth/current-session", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json: ApiResponse<CurrentSessionResponseDto> = await res.json();
            if (res.ok && json.success && json.data) {
                return json.data;
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    return {
        login,
        logout,
        fetchSession,
        loading,
    };
}