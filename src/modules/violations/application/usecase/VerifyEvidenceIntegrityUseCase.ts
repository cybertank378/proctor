//Files: src/modules/violations/application/usecase/VerifyEvidenceIntegrityUseCase.ts
import fs from "node:fs/promises";
import {BaseUseCase} from "@/core/application/base/BaseUseCase";
import {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {CryptoHashContract} from "@/shared/contract/CryptoHashContract";
import type {ViolationRepositoryContract} from "../../domain/contract/ViolationRepositoryContract";
import type {VerifyEvidenceIntegrityRequestDto} from "../../domain/dto/ViolationRequestDto";
import type {VerifyIntegrityResultDto} from "../../domain/dto/ViolationResponseDto";
import {ViolationValidator} from "../../domain/validation/ViolationValidator";

export class VerifyEvidenceIntegrityUseCase extends BaseUseCase<
    VerifyEvidenceIntegrityRequestDto,
    VerifyIntegrityResultDto
> {
    constructor(
        private readonly repository: ViolationRepositoryContract,
        private readonly cryptoUtil: CryptoHashContract
    ) {
        super();
    }

    public async execute(
        input: VerifyEvidenceIntegrityRequestDto
    ): Promise<AppResult<VerifyIntegrityResultDto>> {
        try {
            ViolationValidator.validateViolationId(input.violationId);

            const record = await this.repository.findById(input.violationId);
            if (!record) {
                return AppResultFactory.failure("Catatan bukti pelanggaran tidak ditemukan.", 404);
            }

            let fileBuffer: Buffer;
            try {
                fileBuffer = await fs.readFile(record.localFilePath);
            } catch {
                return AppResultFactory.failure(
                    `File fisik bukti snapshot tidak ditemukan pada lokasi server: ${record.localFilePath}`,
                    404
                );
            }

            const calculatedHash = this.cryptoUtil.computeSha256(fileBuffer);
            const isAuthentic = this.cryptoUtil.verifySha256(fileBuffer, record.sha256Hash);

            return AppResultFactory.success({
                violationId: record.id,
                isAuthentic,
                expectedHash: record.sha256Hash,
                calculatedHash,
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal memverifikasi integritas file bukti.";
            return AppResultFactory.failure(msg, 500);
        }
    }
}