//Files: src/modules/violations/domain/dto/ViolationRequestDto.ts
import type {ViolationType} from "../entity/ViolationRecordEntity";

export interface RecordViolationRequestDto {
    readonly attemptRecordId: string;
    readonly type: ViolationType;
    readonly localFilePath: string;
    readonly fileUrl: string;
    readonly sha256Hash: string;
    readonly metadata: Record<string, unknown>;
}

export interface VerifyEvidenceIntegrityRequestDto {
    readonly violationId: string;
}