// Files: src/modules/violations/domain/validation/ViolationValidator.ts
import {AppError} from "@/core/domain/error/AppError";
import type {ViolationType} from "../entity/ViolationRecordEntity";

const VALID_VIOLATION_TYPES: readonly ViolationType[] = [
    "TAB_SWITCH",
    "WINDOW_BLUR",
    "DEVTOOLS_OPEN",
    "RESTRICTED_KEY",
    "MULTI_MONITOR",
];

export interface IViolationValidator {
    validateType(type: string): asserts type is ViolationType;
    validateAttemptRecordId(attemptRecordId: string): void;
    validateViolationId(violationId: string): void;
}

export const ViolationValidator: IViolationValidator = {
    validateType(type: string): asserts type is ViolationType {
        if (!VALID_VIOLATION_TYPES.includes(type as ViolationType)) {
            throw new AppError(`Tipe insiden pelanggaran '${type}' tidak didukung sistem.`, 400);
        }
    },

    validateAttemptRecordId(attemptRecordId: string): void {
        if (!attemptRecordId || !attemptRecordId.trim()) {
            throw new AppError("attemptRecordId wajib disertakan.", 400);
        }
    },

    validateViolationId(violationId: string): void {
        if (!violationId || !violationId.trim()) {
            throw new AppError("violationId bukti pelanggaran wajib disertakan.", 400);
        }
    }
};