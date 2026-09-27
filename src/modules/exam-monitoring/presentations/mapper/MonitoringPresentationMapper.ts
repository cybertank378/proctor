// Files: src/modules/exam-monitoring/presentations/mapper/MonitoringPresentationMapper.ts

import type {
  ActiveQuizResolutionDto,
  ExamAttemptSummaryDto,
  UnlockAttemptResponseDto,
} from "../../domain/dto/MonitoringResponseDto";
import type {ExamAttemptEntity} from "../../domain/entity/ExamAttemptEntity";
import {PinGenerator} from "@/shared/helpers/PinGenerator";

export const MonitoringPresentationMapper = {
  toSummaryDto(entity: ExamAttemptEntity): ExamAttemptSummaryDto {
    const safeUpdatedAt = entity.updatedAt
      ? new Date(entity.updatedAt).toISOString()
      : new Date().toISOString();

    return {
      id: entity.id,
      quizId: entity.quizId,
      userId: entity.userId,
      attemptId: entity.attemptId,
      // Memetakan nama siswa dan kelas dari entity
      studentName: entity.studentName ?? `Siswa #${entity.userId}`,
      className: entity.className ?? "-",
      roomNumber: entity.roomNumber ?? "Umum",
      status: entity.status,
      violationCount: entity.violationCount,
      maxAllowedViolations: entity.maxAllowedViolations,
      isLocked:
        typeof entity.isLocked === "function"
          ? entity.isLocked()
          : Boolean(entity.isLocked),
      unlockPin: PinGenerator.generateForAttempt(entity.attemptId, entity.quizId),
      updatedAt: safeUpdatedAt,
    };
  },

  toUnlockDto(entity: ExamAttemptEntity): UnlockAttemptResponseDto {
    const safeUpdatedAt = entity.updatedAt
      ? new Date(entity.updatedAt).toISOString()
      : new Date().toISOString();

    return {
      attemptId: entity.attemptId,
      status: entity.status,
      unlockedAt: safeUpdatedAt,
      unlockedByProctorId: entity.unlockedByProctorId ?? "",
    };
  },

  toActiveQuizDto(
    quizId: number,
    source: "ACTIVE_SESSION" | "MOODLE_SCHEDULE" | "FALLBACK_HISTORY",
    quizName?: string,
  ): ActiveQuizResolutionDto {
    return {
      quizId,
      source,
      ...(quizName ? { quizName } : {}),
    };
  },
};
