// src/modules/exam-monitoring/domain/dto/MonitoringResponseDto.ts
import type {AttemptStatus} from "../entity/ExamAttemptEntity";

export interface ExamAttemptSummaryDto {
  readonly id: string;
  readonly quizId: number;
  readonly userId: number;
  readonly attemptId: number;
  readonly studentName?: string | null;
  readonly className?: string | null;
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

export interface ActiveQuizResolutionDto {
  readonly quizId: number;
  readonly quizName?: string;
  readonly source: "ACTIVE_SESSION" | "MOODLE_SCHEDULE" | "FALLBACK_HISTORY";
}
