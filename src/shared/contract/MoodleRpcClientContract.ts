//Files: src/shared/contract/MoodleRpcClientContract.ts
export interface MoodleUnlockStudentParams {
    readonly quizId: number;
    readonly userId: number;
    readonly attemptId: number;
    readonly unlockedByProctorMoodleId: number;
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
}