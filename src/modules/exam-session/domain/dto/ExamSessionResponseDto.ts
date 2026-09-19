// Files: src/modules/exam-session/domain/dto/ExamSessionResponseDto.ts

export interface ExamSessionStatusDto {
  readonly attemptId: number;
  readonly quizId: number;
  readonly studentIdentifier: string;
  readonly isLocked: boolean;
  readonly violationCount: number;
  readonly maxAllowedViolations: number;
  readonly canResume: boolean;
  readonly moodleEmbedUrl: string;
}

export interface RecordViolationResultDto {
  readonly success: boolean;
  readonly isLocked: boolean;
  readonly currentViolations: number;
  readonly remainingTolerance: number;
  readonly incidentId?: string;
}

export interface StartExamSessionResultDto {
  readonly isValid: boolean;
  readonly quizId: number;
  readonly embedUrl: string;
}
