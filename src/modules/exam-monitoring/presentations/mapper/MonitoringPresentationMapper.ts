//Files: src/modules/exam-monitoring/presentations/mapper/MonitoringPresentationMapper.ts
import type {ExamAttemptEntity} from "../../domain/entity/ExamAttemptEntity";
import type {ExamAttemptSummaryDto, UnlockAttemptResponseDto,} from "../../domain/dto/MonitoringResponseDto";

export const MonitoringPresentationMapper = {
    toSummaryDto(entity: ExamAttemptEntity): ExamAttemptSummaryDto {
        return {
            id: entity.id,
            quizId: entity.quizId,
            userId: entity.userId,
            attemptId: entity.attemptId,
            roomNumber: entity.roomNumber,
            status: entity.status,
            violationCount: entity.violationCount,
            maxAllowedViolations: entity.maxAllowedViolations,
            isLocked: entity.isLocked(),
            updatedAt: entity.updatedAt.toISOString(),
        };
    },

    toUnlockDto(entity: ExamAttemptEntity): UnlockAttemptResponseDto {
        return {
            attemptId: entity.attemptId,
            status: entity.status,
            unlockedAt: entity.updatedAt.toISOString(),
            unlockedByProctorId: entity.unlockedByProctorId ?? "",
        };
    }
}