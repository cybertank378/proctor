//Files: src/modules/proctor-chat/infrastructure/http/ProctorChatHttpHandler.ts
import { BaseHttpHandler } from "@/core/infrastructure/http/BaseHttpHandler";
import type { HttpRequest } from "@/core/infrastructure/http/HttpRequest";
import { HttpResponse } from "@/core/infrastructure/http/HttpResponse";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import type { ProctorChatService } from "../../application/service/ProctorChatService";
import type { SendChatMessageRequestDto } from "../../domain/dto/ChatRequestDto";

export class ProctorChatHttpHandler extends BaseHttpHandler {
  constructor(
    private readonly chatService: ProctorChatService,
    private readonly proctorResolver: (
      token: string,
    ) => Promise<ProctorUserEntity | null>,
  ) {
    super();
  }

  protected async process(req: HttpRequest): Promise<Response> {
    // 1. Endpoint Otomasi Pruning Pesan Kadaluarsa
    if (req.method === "POST" && req.url.includes("/prune")) {
      const body = req.body as { retentionDays?: number };
      const result = await this.chatService.pruneExpired({
        retentionDays: body?.retentionDays,
      });
      return HttpResponse.success(result.data, result.message, 200);
    }

    // Resolusi Pengawas Terautentikasi
    const authContext = this.getAuthenticatedProctor(req);
    const proctor = await this.proctorResolver(authContext.token);

    if (!proctor || !proctor.isActive) {
      return HttpResponse.success(
        { error: "Sesi pengawas tidak valid atau akun dinonaktifkan." },
        undefined,
        401,
      );
    }

    // 2. Mengirim Pesan Koordinasi Baru
    if (req.method === "POST") {
      const body = req.body as SendChatMessageRequestDto;
      const result = await this.chatService.sendMessage(body, proctor);

      if (result.isFailure) {
        return HttpResponse.success(
          { error: result.error },
          result.error,
          result.statusCode,
        );
      }

      return HttpResponse.success(result.data, result.message, 201);
    }

    // 3. Mengambil Pesan Koordinasi Terkini
    if (req.method === "GET") {
      const url = new URL(req.url);
      const quizIdParam = url.searchParams.get("quizId");
      console.log(
        "[DEBUG CHAT GET] Request quizId:",
        quizIdParam,
        "Referer:",
        req.headers.get("referer"),
      );
      const limitParam = url.searchParams.get("limit");

      if (!quizIdParam) {
        return HttpResponse.success(
          { error: "Parameter 'quizId' wajib disertakan." },
          undefined,
          400,
        );
      }

      const result = await this.chatService.getMessages(
        {
          quizId: Number(quizIdParam),
          roomNumber: url.searchParams.get("roomNumber"),
          limit: limitParam ? Number(limitParam) : 50,
        },
        proctor,
      );

      if (result.isFailure) {
        return HttpResponse.success(
          { error: result.error },
          result.error,
          result.statusCode,
        );
      }

      return HttpResponse.success(result.data, undefined, 200);
    }

    return HttpResponse.success(
      { error: "Metode HTTP tidak diizinkan." },
      undefined,
      405,
    );
  }
}
