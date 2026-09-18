//Files: src/modules/exam-monitoring/domain/validation/MonitoringValidator.ts
import {AppError} from "@/core/domain/error/AppError";

export const MonitoringValidator = {
    validateAttemptId(attemptId: number): void {
        if (!Number.isInteger(attemptId) || attemptId <= 0) {
            throw new AppError("ID attempt pengerjaan ujian harus berupa bilangan bulat positif.", 400);
        }
    },

    validatePagination(page: number, pageSize: number): void {
        if (!Number.isInteger(page) || page < 1) {
            throw new AppError("Parameter page harus lebih besar dari 0.", 400);
        }
        if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
            throw new AppError("Parameter pageSize harus berada dalam rentang 1-100.", 400);
        }
    }
}