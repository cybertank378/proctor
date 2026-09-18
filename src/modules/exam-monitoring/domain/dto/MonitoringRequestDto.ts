//Files: src/modules/exam-monitoring/domain/dto/MonitoringRequestDto.ts
export interface UnlockAttemptRequestDto {
    readonly attemptId: number;
    readonly reason?: string;
}

export interface GetAttemptsFilterDto {
    readonly quizId?: number;
    readonly roomNumber?: string | null;
    readonly status?: string;
    readonly page?: number;
    readonly pageSize?: number;
}