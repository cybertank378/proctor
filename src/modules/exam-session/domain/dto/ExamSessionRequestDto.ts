//Files: src/modules/exam-session/domain/dto/ExamSessionRequestDto.ts
import type {ViolationType} from "@/generated/prisma/enums";

export interface RecordViolationRequestDto {
  readonly quizId: number;
  readonly attemptId?: number;
  readonly studentIdentifier?: string;
  readonly violationType: ViolationType;
  readonly reason: string;
  readonly timestamp: string;
  readonly screenshotBase64?: string;
}

export interface VerifyAttemptRequestDto {
  readonly quizId: number;
  readonly attemptId?: number;
}

export interface StartExamSessionRequestDto {
  readonly quizId: number;
  readonly studentIdentifier?: string;
}

export interface LockAttemptRequestDto {
  readonly attemptId: number;
  readonly reason?: string;
}
