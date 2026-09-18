//Files: src/modules/violations/presentations/mapper/ViolationPresentationMapper.ts
import type {ViolationRecordEntity} from "../../domain/entity/ViolationRecordEntity";
import type {ViolationSummaryDto} from "../../domain/dto/ViolationResponseDto";

export const ViolationPresentationMapper = {
    toSummaryDto(entity: ViolationRecordEntity): ViolationSummaryDto {
        return {
            id: entity.id,
            attemptRecordId: entity.attemptRecordId,
            type: entity.type,
            fileUrl: entity.fileUrl,
            sha256Hash: entity.sha256Hash,
            metadata: entity.metadata,
            createdAt: entity.createdAt.toISOString(),
        };
    }
}