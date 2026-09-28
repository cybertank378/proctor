// src/modules/proctor-management/infrastructure/http/ProctorManagementHttpHandler.ts
import { BaseHttpHandler } from "@/core/infrastructure/http/BaseHttpHandler";
import type { HttpRequest } from "@/core/infrastructure/http/HttpRequest";
import { HttpResponse } from "@/core/infrastructure/http/HttpResponse";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import type { ProctorManagementService } from "../../application/service/ProctorManagementService";
import type {
  AssignProctorRoomRequestDto,
  CreateProctorRequestDto,
} from "../../domain/dto/ProctorManagementRequestDto";

export class ProctorManagementHttpHandler extends BaseHttpHandler {
  constructor(
    private readonly proctorService: ProctorManagementService,
    private readonly proctorResolver: (
      token: string,
    ) => Promise<ProctorUserEntity | null>,
  ) {
    super();
  }

  protected async process(req: HttpRequest): Promise<Response> {
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

    const url = new URL(req.url);

    // 1. Mengambil Daftar Pengawas
    if (req.method === "GET") {
      const roomNumber = url.searchParams.get("roomNumber") || undefined;
      const result = await this.proctorService.listProctors(roomNumber);

      if (result.isFailure) {
        return HttpResponse.success(
          { error: result.error },
          result.error,
          result.statusCode,
        );
      }

      return HttpResponse.success(result.data, result.message, 200);
    }

    // 2. Operasi Mutasi Data Pengawas
    if (req.method === "POST") {
      // A. Sinkronisasi Data Guru dari Database Moodle
      if (url.pathname.endsWith("/sync-moodle")) {
        const result = await this.proctorService.syncTeachersFromMoodle();

        if (result.isFailure) {
          return HttpResponse.success(
            { error: result.error },
            result.error,
            result.statusCode,
          );
        }

        return HttpResponse.success(result.data, result.message, 200);
      }

      // B. Alokasi / Penugasan Pengawas ke Ruangan Ujian
      if (url.pathname.endsWith("/assign")) {
        const body = req.body as AssignProctorRoomRequestDto;
        const result = await this.proctorService.assignRoom(body);

        if (result.isFailure) {
          return HttpResponse.success(
            { error: result.error },
            result.error,
            result.statusCode,
          );
        }

        return HttpResponse.success(result.data, result.message, 200);
      }

      // C. Pembuatan Akun Pengawas Baru secara Manual
      const body = req.body as CreateProctorRequestDto;
      const result = await this.proctorService.createProctor(body);

      if (result.isFailure) {
        return HttpResponse.success(
          { error: result.error },
          result.error,
          result.statusCode,
        );
      }

      return HttpResponse.success(result.data, result.message, 201);
    }

    return HttpResponse.success(
      { error: "Metode HTTP tidak diizinkan." },
      undefined,
      405,
    );
  }
}
