// Files: src/shared/contract/MoodleRpcClientContract.ts

export interface MoodleUnlockStudentParams {
  readonly quizId: number;
  readonly userId: number;
  readonly attemptId: number;
  readonly unlockedByProctorMoodleId: number;
}

export interface MoodleRpcResponse {
  readonly success: boolean;
  readonly message?: string;
}

export interface MoodleActiveQuizItem {
  readonly quizId: number;
  readonly courseId: number;
  readonly courseName: string;
  readonly quizName: string;
  readonly timeOpen: number;
  readonly timeClose: number;
}

export interface MoodleActiveAttemptItem {
  readonly attemptId: number;
  readonly quizId: number;
  readonly userId: number;
  readonly studentName: string;
  readonly className: string;
  readonly roomNumber?: string | null;
  readonly status: "inprogress" | "finished" | "abandoned";
  readonly islocked?: boolean;
  readonly timestart: number;
  readonly timefinish: number;
}

export interface MoodleRpcClientContract {
  unlockStudentAttempt(
    params: MoodleUnlockStudentParams,
  ): Promise<MoodleRpcResponse>;
  getActiveQuizzes(): Promise<readonly MoodleActiveQuizItem[]>;
  getActiveAttempts(
    quizId: number,
  ): Promise<readonly MoodleActiveAttemptItem[]>;
}
