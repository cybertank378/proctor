// Files: src/modules/exam-monitoring/infrastructure/rpc/MoodleGuardRpcClient.ts

import { AppConfig } from "@/shared/config/AppConfig";
import type {
  MoodleActiveAttemptItem,
  MoodleActiveQuizItem,
  MoodleRpcClientContract,
  MoodleRpcResponse,
  MoodleUnlockStudentParams,
} from "@/shared/contract/MoodleRpcClientContract";

export class MoodleGuardRpcClient implements MoodleRpcClientContract {
  public async unlockStudentAttempt(
    params: MoodleUnlockStudentParams,
  ): Promise<MoodleRpcResponse> {
    const config = AppConfig.get();

    if (!config.moodleWsToken) {
      return {
        success: true,
        message:
          "RPC diabaikan dalam mode lokal tanpa konfigurasi token Moodle.",
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

      const result = (await response.json()) as {
        status?: boolean;
        message?: string;
      };
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

  public async getActiveQuizzes(): Promise<readonly MoodleActiveQuizItem[]> {
    const config = AppConfig.get();

    if (!config.moodleWsToken || !config.moodleWsUrl) {
      return [];
    }

    try {
      const url = new URL(config.moodleWsUrl);
      url.searchParams.set("wstoken", config.moodleWsToken);
      url.searchParams.set("wsfunction", "quizaccess_guard_get_active_quizzes");
      url.searchParams.set("moodlewsrestformat", "json");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      if (!Array.isArray(result)) {
        return [];
      }

      return result.map((item: Record<string, unknown>) => ({
        quizId: Number(item.quiz_id),
        courseId: Number(item.course_id),
        courseName: String(item.course_name ?? ""),
        quizName: String(item.quiz_name ?? ""),
        timeOpen: Number(item.timeopen ?? 0),
        timeClose: Number(item.timeclose ?? 0),
      }));
    } catch {
      return [];
    }
  }

  public async getActiveAttempts(
    quizId: number,
  ): Promise<readonly MoodleActiveAttemptItem[]> {
    const config = AppConfig.get();

    if (
      !config.moodleWsToken ||
      !config.moodleWsUrl ||
      !quizId ||
      quizId <= 0
    ) {
      return [];
    }

    try {
      const url = new URL(config.moodleWsUrl);
      url.searchParams.set("wstoken", config.moodleWsToken);
      url.searchParams.set(
        "wsfunction",
        "quizaccess_guard_get_active_attempts",
      );
      url.searchParams.set("moodlewsrestformat", "json");

      console.info(
        `[MOODLE RPC] ⏳ Menghubungkan ke Moodle WebService: ${url.origin} (wsfunction: quizaccess_guard_get_active_attempts, quizId: ${quizId}). Harap menunggu respon Moodle...`
      );

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          quizid: String(quizId),
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[MOODLE RPC ERROR] Server Moodle merespons HTTP ${response.status}:`,
          errorText
        );
        return [];
      }

      const result = await response.json();

      // Cek apakah Moodle mengembalikan pesan exception
      if (result && !Array.isArray(result) && (result.exception || result.message)) {
        console.error(
          `[MOODLE RPC EXCEPTION] Moodle WebService mengembalikan exception error:`,
          result
        );
        return [];
      }

      if (!Array.isArray(result)) {
        console.warn(
          `[MOODLE RPC WARN] Format data dari Moodle bukan array:`,
          result
        );
        return [];
      }

      console.info(
        `[MOODLE RPC SUCCESS] ✅ Menerima ${result.length} data pengerjaan aktif dari Moodle untuk Quiz ID ${quizId}.`
      );

      return result.map((item: Record<string, unknown>) => {
        const fullName =
          item.studentName ||
          item.fullname ||
          [item.firstname, item.lastname].filter(Boolean).join(" ") ||
          `Siswa #${item.userId || item.userid}`;

        return {
          attemptId: Number(
            item.attemptId || item.attemptid || item.attempt_id,
          ),
          quizId: Number(item.quizId || item.quizid || item.quiz_id || quizId),
          userId: Number(item.userId || item.userid || item.user_id),
          studentName: String(fullName),
          className: String(
            item.className ||
              item.department ||
              item.classname ||
              item.class ||
              "-",
          ),
          roomNumber:
            item.roomNumber || item.roomnumber
              ? String(item.roomNumber || item.roomnumber)
              : null,
          status:
            item.status === "finished" || item.state === "finished"
              ? "finished"
              : "inprogress",
          islocked: Boolean(item.islocked),
          timestart: Number(item.timestart ?? 0),
          timefinish: Number(item.timefinish ?? 0),
        };
      });
    } catch (error) {
      console.error("[MOODLE RPC ERROR] Gagal mengambil siswa aktif dari Moodle:", error);
      return [];
    }
  }
}
