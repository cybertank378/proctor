// Files: src/modules/exam-monitoring/infrastructure/builder/ExamMonitoringQueryBuilder.ts
import type { AttemptStatus } from "@/generated/prisma/enums";

export const ExamMonitoringQueryBuilder = {
  buildFilter(filter: {
    readonly quizId?: number;
    readonly roomNumber?: string | null;
    readonly status?: string;
  }): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    // Filter Quiz ID jika ada
    if (filter.quizId && filter.quizId > 0) {
      where.quizId = Number(filter.quizId);
    }

    // Filter ruangan jika diisi secara eksplisit
    if (filter.roomNumber && filter.roomNumber.trim().length > 0) {
      where.roomNumber = filter.roomNumber.trim();
    }

    // HANYA filter status jika frontend meminta status tertentu
    if (
      filter.status &&
      filter.status.trim().length > 0 &&
      filter.status !== "ALL"
    ) {
      where.status = filter.status.trim() as AttemptStatus;
    }

    return where;
  },
};
