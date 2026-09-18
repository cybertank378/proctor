//Files: src/modules/exam-monitoring/infrastructure/rpc/MoodleGuardRpcClient.ts
import type {
    MoodleRpcClientContract,
    MoodleRpcResponse,
    MoodleUnlockStudentParams,
} from "@/shared/contract/MoodleRpcClientContract";
import {AppConfig} from "@/shared/config/AppConfig";

export class MoodleGuardRpcClient implements MoodleRpcClientContract {
    public async unlockStudentAttempt(
        params: MoodleUnlockStudentParams
    ): Promise<MoodleRpcResponse> {
        const config = AppConfig.get();

        if (!config.moodleWsToken) {
            return {
                success: true,
                message: "RPC diabaikan dalam mode lokal tanpa konfigurasi token Moodle.",
            };
        }

        try {
            const url = new URL(config.moodleWsUrl);
            url.searchParams.set("wstoken", config.moodleWsToken);
            url.searchParams.set("wsfunction", "quizaccess_guard_unlock_student");
            url.searchParams.set("moodlewsrestformat", "json");

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    quizid: String(params.quizId),
                    userid: String(params.userId),
                    attemptid: String(params.attemptId),
                    unlockedby: String(params.unlockedByProctorMoodleId),
                }),
            });

            if (!response.ok) {
                return {
                    success: false,
                    message: `Server Moodle merespons HTTP ${response.status}`,
                };
            }

            const result = (await response.json()) as { status?: boolean; message?: string };
            return {
                success: result.status ?? true,
                message: result.message,
            };
        } catch {
            return {
                success: false,
                message: "Gagal terhubung ke Moodle RPC endpoint.",
            };
        }
    }
}