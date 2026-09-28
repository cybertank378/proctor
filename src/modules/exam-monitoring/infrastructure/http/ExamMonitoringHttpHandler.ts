import { BaseHttpHandler } from "@/core/infrastructure/http/BaseHttpHandler";
import type { HttpRequest } from "@/core/infrastructure/http/HttpRequest";
import { HttpResponse } from "@/core/infrastructure/http/HttpResponse";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import type { ExamMonitoringService } from "../../application/service/ExamMonitoringService";
import type { UnlockExamAttemptUseCase } from "../../application/usecase/UnlockExamAttemptUseCase";
import type { UnlockAttemptRequestDto } from "../../domain/dto/MonitoringRequestDto";

export class ExamMonitoringHttpHandler extends BaseHttpHandler {
  constructor(
    private readonly monitoringService: ExamMonitoringService,
    private readonly unlockUseCase: UnlockExamAttemptUseCase,
    private readonly proctorResolver: (
      token: string,
    ) => Promise<ProctorUserEntity | null>,
  ) {
    super();
  }

  protected async process(req: HttpRequest): Promise<Response> {
    const url = new URL(req.url);
    const authContext = this.getAuthenticatedProctor(req);
    const proctor = await this.proctorResolver(authContext.token);

    if (!proctor || !proctor.isActive) {
      return HttpResponse.success(
        { error: "Sesi pengawas tidak valid atau nonaktif." },
        undefined,
        401,
      );
    }

    if (req.method === "GET") {

      // 1. Rute Deteksi Kuis Aktif
      if (url.pathname.includes("/active-quiz")) {
        const result = await this.monitoringService.getActiveQuiz(
          url.searchParams.get("roomNumber"),
          proctor,
        );

        if (result.isFailure) {
          return HttpResponse.success(
            { error: result.error },
            result.error,
            result.statusCode ?? 500,
          );
        }

        // Mengembalikan HTTP 200 (data: ActiveQuizResolutionDto atau null)
        return HttpResponse.success(result.data, undefined, 200);
      }

      // 1.5. Rute Daftar Sesi Ujian Aktif
      if (url.pathname.includes("/sessions")) {
        const result = await this.monitoringService.listActiveQuizzes(proctor);

        if (result.isFailure) {
          return HttpResponse.success(
            { error: result.error },
            result.error,
            result.statusCode ?? 500,
          );
        }

        return HttpResponse.success(result.data, undefined, 200);
      }

      // 2. Rute Riwayat Siswa (Attempts)
      const quizIdParam = url.searchParams.get("quizId");
      const pageParam = url.searchParams.get("page");
      const pageSizeParam = url.searchParams.get("pageSize");

      const result = await this.monitoringService.getAttempts(
        {
          quizId: quizIdParam ? Number(quizIdParam) : undefined,
          roomNumber: url.searchParams.get("roomNumber"),
          status: url.searchParams.get("status") || undefined,
          page: pageParam ? Number(pageParam) : 1,
          pageSize: pageSizeParam ? Number(pageSizeParam) : 10,
        },
        proctor,
      );

      if (result.isFailure || !result.data) {
        return HttpResponse.success(
          { error: result.error },
          result.error,
          result.statusCode,
        );
      }

      return HttpResponse.paginated(result.data.items, result.data.meta);
    }

    if (req.method === "POST" && req.url.includes("/unlock")) {
      const body = req.body as UnlockAttemptRequestDto;
      const result = await this.unlockUseCase.execute({ dto: body, proctor });

      if (result.isFailure) {
        return HttpResponse.success(
          { error: result.error },
          result.error,
          result.statusCode,
        );
      }

      return HttpResponse.success(result.data, result.message, 200);
    }

    return HttpResponse.success(
      { error: "Metode tidak diizinkan." },
      undefined,
      405,
    );
  }
}
