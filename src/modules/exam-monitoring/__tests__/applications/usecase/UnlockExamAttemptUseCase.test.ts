// Files: src/modules/exam-monitoring/__tests__/applications/usecase/UnlockExamAttemptUseCase.test.ts
import {describe, expect, it, vi} from "vitest";
import {ProctorUserEntity} from "@/modules/auth/domain/entity/ProctorUserEntity";
import {ExamAttemptEntity} from "@/modules/exam-monitoring/domain/entity/ExamAttemptEntity";
import {UnlockExamAttemptUseCase} from "@/modules/exam-monitoring/application/usecase/UnlockExamAttemptUseCase";
import type {
    ExamMonitoringRepositoryContract
} from "@/modules/exam-monitoring/domain/contract/ExamMonitoringRepositoryContract";
import type {MoodleRpcClientContract} from "@/shared/contract/MoodleRpcClientContract";

describe("UnlockExamAttemptUseCase (Application Layer Suite)", () => {
    const proctor = new ProctorUserEntity({
        id: "proctor-uuid-1",
        moodleUserId: 15,
        username: "proctor_lab1",
        passwordHash: "$argon2id$mock",
        fullName: "Ahmad Dahlan",
        role: "PROCTOR",
        roomNumber: "Lab 01",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const lockedAttempt = new ExamAttemptEntity({
        id: "att-record-1",
        quizId: 2,
        userId: 50,
        attemptId: 1001,
        roomNumber: "Lab 01",
        status: "LOCKED",
        violationCount: 3,
        maxAllowedViolations: 3,
        disqualificationReason: null,
        isLockedByProctor: true,
        unlockedByProctorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const createBaseMockRepo = (): ExamMonitoringRepositoryContract => ({
        findByAttemptId: vi.fn(),
        findActiveAttempts: vi.fn(),
        unlockAttempt: vi.fn(),
        findActiveQuizByRoom: vi.fn().mockResolvedValue(null),
        findLatestQuizId: vi.fn().mockResolvedValue(null),
    });

    const createBaseMockRpc = (): MoodleRpcClientContract => ({
        unlockStudentAttempt: vi.fn(),
        getActiveQuizzes: vi.fn().mockResolvedValue([]),
    });

    describe("Positive Cases", () => {
        it("harus berhasil membuka kunci saat ruangan cocok dan Moodle RPC sukses (AAA Pattern)", async () => {
            // Arrange
            const mockRepo: ExamMonitoringRepositoryContract = {
                ...createBaseMockRepo(),
                findByAttemptId: vi.fn().mockResolvedValue(lockedAttempt),
                unlockAttempt: vi.fn().mockResolvedValue(
                    new ExamAttemptEntity({
                        ...lockedAttempt,
                        status: "IN_PROGRESS",
                        isLockedByProctor: false,
                        unlockedByProctorId: proctor.id,
                    })
                ),
            };
            const mockRpc: MoodleRpcClientContract = {
                ...createBaseMockRpc(),
                unlockStudentAttempt: vi.fn().mockResolvedValue({ success: true }),
            };

            const useCase = new UnlockExamAttemptUseCase(mockRepo, mockRpc);

            // Act
            const result = await useCase.execute({
                dto: { attemptId: 1001 },
                proctor,
            });

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(mockRpc.unlockStudentAttempt).toHaveBeenCalledTimes(1);
            expect(mockRepo.unlockAttempt).toHaveBeenCalledWith(1001, proctor.id);
        });
    });

    describe("Negative Cases", () => {
        it("harus gagal jika proctor mencoba unlock attempt di ruangan lain (AAA Pattern)", async () => {
            // Arrange
            const attemptOtherRoom = new ExamAttemptEntity({
                ...lockedAttempt,
                roomNumber: "Lab 02",
            });
            const mockRepo: ExamMonitoringRepositoryContract = {
                ...createBaseMockRepo(),
                findByAttemptId: vi.fn().mockResolvedValue(attemptOtherRoom),
            };
            const mockRpc = createBaseMockRpc();

            const useCase = new UnlockExamAttemptUseCase(mockRepo, mockRpc);

            // Act
            const result = await useCase.execute({
                dto: { attemptId: 1001 },
                proctor,
            });

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.statusCode).toBe(403);
            expect(mockRpc.unlockStudentAttempt).not.toHaveBeenCalled();
        });

        it("harus mengembalikan status 502 jika Moodle RPC merespons kegagalan (AAA Pattern)", async () => {
            // Arrange
            const mockRepo: ExamMonitoringRepositoryContract = {
                ...createBaseMockRepo(),
                findByAttemptId: vi.fn().mockResolvedValue(lockedAttempt),
            };
            const mockRpc: MoodleRpcClientContract = {
                ...createBaseMockRpc(),
                unlockStudentAttempt: vi.fn().mockResolvedValue({
                    success: false,
                    message: "Attempt ID pada database Moodle tidak ditemukan",
                }),
            };

            const useCase = new UnlockExamAttemptUseCase(mockRepo, mockRpc);

            // Act
            const result = await useCase.execute({
                dto: { attemptId: 1001 },
                proctor,
            });

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.statusCode).toBe(502);
            expect(mockRepo.unlockAttempt).not.toHaveBeenCalled();
        });
    });
});