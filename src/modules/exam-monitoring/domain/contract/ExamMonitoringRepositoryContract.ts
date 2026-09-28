// Files: src/modules/exam-monitoring/domain/contract/ExamMonitoringRepositoryContract.ts

import type { MoodleActiveAttemptItem } from "@/shared/contract/MoodleRpcClientContract";
import type { ExamAttemptEntity } from "../entity/ExamAttemptEntity";

export interface ExamMonitoringRepositoryContract {
  findByAttemptId(attemptId: number): Promise<ExamAttemptEntity | null>;
  findActiveAttempts(filter: {
    readonly quizId?: number;
    readonly roomNumber?: string | null;
    readonly status?: string;
    readonly skip: number;
    readonly take: number;
  }): Promise<{ readonly items: ExamAttemptEntity[]; readonly total: number }>;
  unlockAttempt(
    attemptId: number,
    proctorId: string,
  ): Promise<ExamAttemptEntity>;
  findActiveQuizByRoom(roomNumber?: string | null): Promise<number | null>;
  findLatestQuizId(): Promise<number | null>;
  syncMoodleAttempts(
    moodleAttempts: readonly MoodleActiveAttemptItem[],
  ): Promise<void>;
}
