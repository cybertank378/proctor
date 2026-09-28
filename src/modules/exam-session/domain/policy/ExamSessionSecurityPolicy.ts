// Files: src/modules/exam-session/domain/policy/ExamSessionSecurityPolicy.ts

import type { ExamSessionEntity } from "../entity/ExamSessionEntity";

export const ExamSessionSecurityPolicy = {
  canContinueExam(session: ExamSessionEntity): boolean {
    return (
      !session.isLocked && session.violationCount < session.maxAllowedViolations
    );
  },

  shouldLockOnViolation(
    currentViolations: number,
    maxAllowed: number,
  ): boolean {
    return currentViolations >= maxAllowed;
  },
};
