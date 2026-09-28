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
    if (
      req.method === "POST" &&
      url.pathname.includes("/lock") &&
      !url.pathname.includes("/unlock")
    ) {
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

    // 2.5. Buka Kunci Sesi Siswa dengan PIN (POST /api/exam-session/unlock-with-pin)
    if (
      req.method === "POST" &&
      (url.pathname.endsWith("/unlock-with-pin") ||
        url.pathname.includes("/unlock-with-pin"))
    ) {
      const body = req.body as { attemptId?: number; pin?: string };
      const result = await this.sessionService.unlockWithPin(body);

      if (result.isFailure) {
        return Response.json(
          {
            success: false,
            message: result.error,
          },
          { status: result.statusCode ?? 400 },
        );
      }

      return Response.json(
        {
          success: true,
          message: result.message ?? "Kunci ujian berhasil dibuka dengan PIN.",
          data: result.data,
        },
        { status: 200 },
      );
    }

    // 3. Verifikasi Status Sesi Siswa (GET /api/exam/session)
    if (req.method === "GET") {
      const quizIdParam = url.searchParams.get("quizId");
      const attemptIdParam = url.searchParams.get("attemptId");
      const cmidParam = url.searchParams.get("cmid");
      const userIdParam = url.searchParams.get("userId") ?? url.searchParams.get("uid");
      const signatureParam = url.searchParams.get("signature") ?? url.searchParams.get("sig");

      if (!quizIdParam) {
        return HttpResponse.success(
          { error: "Parameter 'quizId' wajib disertakan.", success: false },
          undefined,
          400,
        );
      }

      const result = await this.sessionService.verifySession({
        quizId: Number(quizIdParam),
        cmid:
          cmidParam && !Number.isNaN(Number(cmidParam))
            ? Number(cmidParam)
            : undefined,
        userId:
          userIdParam && !Number.isNaN(Number(userIdParam))
            ? Number(userIdParam)
            : undefined,
        signature: signatureParam ?? undefined,
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
