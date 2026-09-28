//Files: src/modules/violations/__tests__/application/usecase/RecordViolationUseCase.test.ts
import { describe, expect, it, vi } from "vitest";
import { RecordViolationUseCase } from "@/modules/violations/application/usecase/RecordViolationUseCase";
import type { ViolationRecordEntity } from "@/modules/violations/domain/entity/ViolationRecordEntity";

describe("RecordViolationUseCase (Application Layer Suite)", () => {
  const validSha256 =
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  describe("Positive Cases", () => {
    it("harus mencatat bukti snapshot pelanggaran dan mengembalikan status attempt terkini (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = {
        create: vi
          .fn()
          .mockImplementation(async (entity: ViolationRecordEntity) => entity),
        findById: vi.fn(),
        findByAttemptRecordId: vi.fn(),
        incrementViolationCounter: vi.fn().mockResolvedValue({
          newCount: 3,
          maxAllowed: 3,
          isLocked: true,
        }),
      };

      const useCase = new RecordViolationUseCase(mockRepo);

      // Act
      const result = await useCase.execute({
        attemptRecordId: "att-rec-uuid-1",
        type: "DEVTOOLS_OPEN",
        localFilePath: "public/uploads/snap1.jpg",
        fileUrl: "/uploads/snap1.jpg",
        sha256Hash: validSha256,
        metadata: { browser: "Chrome 130" },
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data?.violation.type).toBe("DEVTOOLS_OPEN");
      expect(result.data?.attemptStatus.isLocked).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(mockRepo.incrementViolationCounter).toHaveBeenCalledWith(
        "att-rec-uuid-1",
      );
    });
  });

  describe("Negative Cases", () => {
    it("harus menolak input jika tipe pelanggaran tidak dikenali sistem (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = {
        create: vi.fn(),
        findById: vi.fn(),
        findByAttemptRecordId: vi.fn(),
        incrementViolationCounter: vi.fn(),
      };
      const useCase = new RecordViolationUseCase(mockRepo);

      // Act
      const result = await useCase.execute({
        attemptRecordId: "att-rec-uuid-1",
        type: "UNKNOWN_TYPE" as unknown as any,
        localFilePath: "public/uploads/snap1.jpg",
        fileUrl: "/uploads/snap1.jpg",
        sha256Hash: validSha256,
        metadata: {},
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain("tidak didukung sistem");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("harus menolak perekaman jika attemptRecordId berupa string kosong (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = {
        create: vi.fn(),
        findById: vi.fn(),
        findByAttemptRecordId: vi.fn(),
        incrementViolationCounter: vi.fn(),
      };
      const useCase = new RecordViolationUseCase(mockRepo);

      // Act
      const result = await useCase.execute({
        attemptRecordId: "   ",
        type: "TAB_SWITCH",
        localFilePath: "public/uploads/snap.jpg",
        fileUrl: "/uploads/snap.jpg",
        sha256Hash: validSha256,
        metadata: {},
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.statusCode).toBe(400);
    });
  });
});
