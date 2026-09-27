// Files: src/modules/exam-session/infrastructure/http/ExamSessionHttpHandler.ts
import { BaseHttpHandler } from "@/core/infrastructure/http/BaseHttpHandler";
import type { HttpRequest } from "@/core/infrastructure/http/HttpRequest";
import { HttpResponse } from "@/core/infrastructure/http/HttpResponse";
import type { ExamSessionService } from "../../application/service/ExamSessionService";
import type { RecordViolationRequestDto } from "../../domain/dto/ExamSessionRequestDto";

export class ExamSessionHttpHandler extends BaseHttpHandler {
  constructor(private readonly sessionService: ExamSessionService) {
    super();
  }

  protected async process(req: HttpRequest): Promise<Response> {
    const url = new URL(req.url);

    // 1. Catat Insiden Pelanggaran (POST /api/violations/record)
    if (
      req.method === "POST" &&
      (url.pathname.endsWith("/record") ||
        url.pathname.includes("/violations/record"))
    ) {
      const body = req.body as RecordViolationRequestDto;
      console.info(
        `[HTTP /api/violations/record] 📥 Menerima laporan pelanggaran: Quiz #${body?.quizId}, Attempt #${body?.attemptId}, Type: ${body?.violationType}`
      );
      const result = await this.sessionService.recordViolation(body);

      if (result.isFailure) {
        console.error(
          `[HTTP /api/violations/record] ❌ Gagal memproses pelanggaran:`,
          result.error
        );
        return HttpResponse.success(
          { error: result.error, success: false },
          result.error,
          result.statusCode ?? 400,
        );
      }

      console.info(
        `[HTTP /api/violations/record] ✅ Berhasil dicatat: AttemptRecord #${result.data?.incidentId}, isLocked: ${result.data?.isLocked}, count: ${result.data?.currentViolations}`
      );
      return HttpResponse.success(result.data, result.message, 201);
    }

    // 2. Kunci Sesi Ujian (POST /api/exam/session/lock)
    if (req.method === "POST" && url.pathname.includes("/lock")) {
      const body = req.body as { attemptId: number; reason?: string };
      const result = await this.sessionService.lockSession(body);

      if (result.isFailure) {
        return HttpResponse.success(
          { error: result.error, success: false },
          result.error,
          result.statusCode ?? 400,
        );
      }

      return HttpResponse.success(result.data, result.message, 200);
    }

    // 3. Verifikasi Status Sesi Siswa (GET /api/exam/session)
    if (req.method === "GET") {
      const quizIdParam = url.searchParams.get("quizId");
      const attemptIdParam = url.searchParams.get("attemptId");

      if (!quizIdParam) {
        return HttpResponse.success(
          { error: "Parameter 'quizId' wajib disertakan.", success: false },
          undefined,
          400,
        );
      }

      const result = await this.sessionService.verifySession({
        quizId: Number(quizIdParam),
        attemptId:
          attemptIdParam && !Number.isNaN(Number(attemptIdParam))
            ? Number(attemptIdParam)
            : undefined,
      });

      if (result.isFailure) {
        return HttpResponse.success(
          { error: result.error, success: false },
          result.error,
          result.statusCode ?? 500,
        );
      }

      return HttpResponse.success(result.data, undefined, 200);
    }

    return HttpResponse.success(
      { error: "Metode tidak diizinkan." },
      undefined,
      405,
    );
  }
}
