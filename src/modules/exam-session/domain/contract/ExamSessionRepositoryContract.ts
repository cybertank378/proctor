// Files: src/modules/exam-session/domain/contract/ExamSessionRepositoryContract.ts

import type {RecordViolationRequestDto} from "../dto/ExamSessionRequestDto";
import type {RecordViolationResultDto} from "../dto/ExamSessionResponseDto";
import type {ExamSessionEntity} from "../entity/ExamSessionEntity";

export interface ExamSessionRepositoryContract {
  findSessionByAttempt(
    quizId: number,
    attemptId?: number,
  ): Promise<ExamSessionEntity | null>;
  saveViolationRecord(
    dto: RecordViolationRequestDto,
  ): Promise<RecordViolationResultDto>;
  lockAttempt(attemptId: number, reason?: string): Promise<boolean>;
}
