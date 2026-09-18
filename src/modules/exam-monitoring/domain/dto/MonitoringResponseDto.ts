//Files: src/modules/exam-monitoring/domain/dto/MonitoringResponseDto.ts
import type {AttemptStatus} from "../entity/ExamAttemptEntity";

export interface ExamAttemptSummaryDto {
    readonly id: string;
    readonly quizId: number;
    readonly userId: number;
    readonly attemptId: number;
    readonly roomNumber: string | null;
    readonly status: AttemptStatus;
    readonly violationCount: number;
    readonly maxAllowedViolations: number;
    readonly isLocked: boolean;
    readonly updatedAt: string;
}

export interface UnlockAttemptResponseDto {
    readonly attemptId: number;
    readonly status: AttemptStatus;
    readonly unlockedAt: string;
    readonly unlockedByProctorId: string;
}