//Files: src/modules/violations/infrastructure/http/ViolationHttpHandler.ts
import {BaseHttpHandler} from "@/core/infrastructure/http/BaseHttpHandler";
import type {HttpRequest} from "@/core/infrastructure/http/HttpRequest";
import {HttpResponse} from "@/core/infrastructure/http/HttpResponse";
import type {ViolationAuditService} from "../../application/service/ViolationAuditService";
import type {RecordViolationRequestDto} from "../../domain/dto/ViolationRequestDto";

export class ViolationHttpHandler extends BaseHttpHandler {
    constructor(private readonly auditService: ViolationAuditService) {
        super();
    }

    protected async process(req: HttpRequest): Promise<Response> {
        // 1. Verifikasi Checksum SHA-256 Anti-Tamper
        if (req.method === "POST" && req.url.includes("/verify-hash")) {
            const body = req.body as { violationId?: string };
            const result = await this.auditService.verifyIntegrity({
                violationId: body.violationId ?? "",
            });

            if (result.isFailure) {
                return HttpResponse.success({ error: result.error }, result.error, result.statusCode);
            }

            return HttpResponse.success(result.data, result.message, 200);
        }

        // 2. Rekam Insiden Pelanggaran Baru
        if (req.method === "POST") {
            const body = req.body as RecordViolationRequestDto;
            const result = await this.auditService.recordIncident(body);

            if (result.isFailure) {
                return HttpResponse.success({ error: result.error }, result.error, result.statusCode);
            }

            return HttpResponse.success(result.data, result.message, result.statusCode);
        }

        // 3. Ambil Riwayat Bukti Pelanggaran berdasarkan attemptRecordId
        if (req.method === "GET") {
            const url = new URL(req.url);
            const attemptRecordId = url.searchParams.get("attemptRecordId");

            if (!attemptRecordId) {
                return HttpResponse.success(
                    { error: "Query parameter 'attemptRecordId' wajib disertakan." },
                    undefined,
                    400
                );
            }

            const result = await this.auditService.getHistory(attemptRecordId);
            if (result.isFailure) {
                return HttpResponse.success({ error: result.error }, result.error, result.statusCode);
            }

            return HttpResponse.success(result.data, undefined, 200);
        }

        return HttpResponse.success({ error: "Metode HTTP tidak diizinkan." }, undefined, 405);
    }
}