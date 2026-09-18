//Files: src/modules/violations/application/usecase/RecordViolationUseCase.ts
import crypto from "node:crypto";
import {BaseUseCase} from "@/core/application/base/BaseUseCase";
import {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {ViolationRepositoryContract} from "../../domain/contract/ViolationRepositoryContract";
import {ViolationRecordEntity} from "../../domain/entity/ViolationRecordEntity";
import type {RecordViolationRequestDto} from "../../domain/dto/ViolationRequestDto";
import type {ViolationSummaryDto} from "../../domain/dto/ViolationResponseDto";
import {ViolationValidator} from "../../domain/validation/ViolationValidator";
import {ViolationPresentationMapper} from "../../presentations/mapper/ViolationPresentationMapper";

export interface RecordViolationResultDto {
    readonly violation: ViolationSummaryDto;
    readonly attemptStatus: {
        readonly violationCount: number;
        readonly maxAllowed: number;
        readonly isLocked: boolean;
    };
}

export class RecordViolationUseCase extends BaseUseCase<
    RecordViolationRequestDto,
    RecordViolationResultDto
> {
    constructor(private readonly repository: ViolationRepositoryContract) {
        super();
    }

    public async execute(input: RecordViolationRequestDto): Promise<AppResult<RecordViolationResultDto>> {
        try {
            ViolationValidator.validateType(input.type);
            ViolationValidator.validateAttemptRecordId(input.attemptRecordId);

            const entity = new ViolationRecordEntity({
                id: crypto.randomUUID(),
                attemptRecordId: input.attemptRecordId,
                type: input.type,
                localFilePath: input.localFilePath,
                fileUrl: input.fileUrl,
                sha256Hash: input.sha256Hash,
                metadata: input.metadata,
                createdAt: new Date(),
            });

            const saved = await this.repository.create(entity);
            const counterStatus = await this.repository.incrementViolationCounter(input.attemptRecordId);

            return AppResultFactory.success(
                {
                    violation: ViolationPresentationMapper.toSummaryDto(saved),
                    attemptStatus: {
                        violationCount: counterStatus.newCount,
                        maxAllowed: counterStatus.maxAllowed,
                        isLocked: counterStatus.isLocked,
                    },
                },
                "Bukti insiden kecurangan berhasil diamankan ke audit log server.",
                201
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal merekam data pelanggaran siswa.";
            return AppResultFactory.failure(msg, 400);
        }
    }
}