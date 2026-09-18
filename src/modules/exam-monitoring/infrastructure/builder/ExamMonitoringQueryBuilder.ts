//Files: src/modules/exam-monitoring/infrastructure/builder/ExamMonitoringQueryBuilder.ts
import type {AttemptStatus} from "../../domain/entity/ExamAttemptEntity";

export class ExamMonitoringQueryBuilder {
    public static buildFilter(filter: {
        readonly quizId?: number;
        readonly roomNumber?: string | null;
        readonly status?: string;
    }): Record<string, unknown> {
        const where: Record<string, unknown> = {};

        if (filter.quizId && filter.quizId > 0) {
            where.quizId = filter.quizId;
        }

        if (filter.roomNumber && filter.roomNumber.trim()) {
            where.roomNumber = filter.roomNumber.trim();
        }

        if (filter.status && filter.status.trim()) {
            where.status = filter.status.trim() as AttemptStatus;
        }

        return where;
    }
}