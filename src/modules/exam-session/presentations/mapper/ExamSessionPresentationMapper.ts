// Files: src/modules/exam-session/presentations/mapper/ExamSessionPresentationMapper.ts

import type { ExamSessionStatusDto } from "../../domain/dto/ExamSessionResponseDto";
import type { ExamSessionEntity } from "../../domain/entity/ExamSessionEntity";

export const ExamSessionPresentationMapper = {
  toDto(entity: ExamSessionEntity, embedUrl: string): ExamSessionStatusDto {
    return {
      attemptId: entity.attemptId,
      quizId: entity.quizId,
      studentIdentifier: entity.studentIdentifier,
      isLocked: entity.isLocked,
      violationCount: entity.violationCount,
      maxAllowedViolations: entity.maxAllowedViolations,
      canResume: entity.canResume(),
      moodleEmbedUrl: embedUrl,
    };
  },
};
