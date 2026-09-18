//Files: src/modules/exam-monitoring/__tests__/domain/ExamAttemptEntity.test.ts
import {describe, expect, it} from "vitest";
import {ExamAttemptEntity} from "@/modules/exam-monitoring/domain/entity/ExamAttemptEntity";

describe("ExamAttemptEntity (Domain Entity Suite)", () => {
    const baseProps = {
        id: "attempt-uuid-1",
        quizId: 10,
        userId: 101,
        attemptId: 5001,
        roomNumber: "Lab 01",
        status: "IN_PROGRESS" as const,
        violationCount: 1,
        maxAllowedViolations: 3,
        disqualificationReason: null,
        isLockedByProctor: false,
        unlockedByProctorId: null,
        createdAt: new Date("2026-09-17T00:00:00.000Z"),
        updatedAt: new Date("2026-09-17T00:00:00.000Z"),
    };

    describe("Positive Cases", () => {
        it("harus membuat instance entitas valid saat data lengkap (AAA Pattern)", () => {
            // Arrange & Act
            const attempt = new ExamAttemptEntity(baseProps);

            // Assert
            expect(attempt.attemptId).toBe(5001);
            expect(attempt.isLocked()).toBe(false);
            expect(attempt.isExceededTolerance()).toBe(false);
            expect(attempt.canBeUnlocked()).toBe(false);
        });

        it("harus menandai bahwa attempt dapat dibuka kuncinya saat status LOCKED (AAA Pattern)", () => {
            // Arrange
            const lockedAttempt = new ExamAttemptEntity({
                ...baseProps,
                status: "LOCKED",
                isLockedByProctor: true,
            });

            // Act & Assert
            expect(lockedAttempt.isLocked()).toBe(true);
            expect(lockedAttempt.canBeUnlocked()).toBe(true);
        });
    });

    describe("Negative & Invariant Cases", () => {
        it("harus melempar error jika quizId, userId, atau attemptId <= 0 (AAA Pattern)", () => {
            // Arrange, Act & Assert
            expect(() => new ExamAttemptEntity({ ...baseProps, quizId: 0 })).toThrow(
                "Identitas quizId, userId, dan attemptId wajib berupa bilangan positif."
            );
            expect(() => new ExamAttemptEntity({ ...baseProps, userId: -1 })).toThrow(
                "Identitas quizId, userId, dan attemptId wajib berupa bilangan positif."
            );
        });

        it("harus menolak pembukaan kunci jika status siswa sudah DISQUALIFIED atau COMPLETED (AAA Pattern)", () => {
            // Arrange
            const disqualifiedAttempt = new ExamAttemptEntity({
                ...baseProps,
                status: "DISQUALIFIED",
                isLockedByProctor: true,
            });
            const completedAttempt = new ExamAttemptEntity({
                ...baseProps,
                status: "COMPLETED",
                isLockedByProctor: false,
            });

            // Act & Assert
            expect(disqualifiedAttempt.canBeUnlocked()).toBe(false);
            expect(completedAttempt.canBeUnlocked()).toBe(false);
        });
    });
});