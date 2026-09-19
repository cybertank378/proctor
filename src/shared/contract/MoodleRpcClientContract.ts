// src/shared/contract/MoodleRpcClientContract.ts

export interface MoodleUnlockStudentParams {
    readonly quizId: number;
    readonly userId: number;
    readonly attemptId: number;
    readonly unlockedByProctorMoodleId: number;
}

export interface MoodleActiveQuizItem {
    readonly quizId: number;
    readonly courseId: number;
    readonly courseName: string;
    readonly quizName: string;
    readonly timeOpen: number;
    readonly timeClose: number;
}

export interface MoodleRpcResponse<T = Record<string, unknown>> {
    readonly success: boolean;
    readonly message?: string;
    readonly data?: T;
}

export interface MoodleRpcClientContract {
    unlockStudentAttempt(
        params: MoodleUnlockStudentParams
    ): Promise<MoodleRpcResponse>;
    getActiveQuizzes(): Promise<readonly MoodleActiveQuizItem[]>;
}