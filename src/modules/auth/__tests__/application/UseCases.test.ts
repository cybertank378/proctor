//Files: src/modules/auth/__tests__/application/UseCases.test.ts
import { describe, expect, it, vi } from "vitest";
import { GetCurrentSessionUseCase } from "../../application/usecase/GetCurrentSessionUseCase";
import { LoginUseCase } from "../../application/usecase/LoginUseCase";
import { LogoutUseCase } from "../../application/usecase/LogoutUseCase";
import type { AuthRepositoryContract } from "../../domain/contract/AuthRepositoryContract";
import type { AuthTokenProviderContract } from "../../domain/contract/AuthTokenProviderContract";
import type { PasswordHasherContract } from "../../domain/contract/PasswordHasherContract";
import { ProctorSessionEntity } from "../../domain/entity/ProctorSessionEntity";
import { ProctorUserEntity } from "../../domain/entity/ProctorUserEntity";

describe("Application UseCases Suite", () => {
  const activeProctor = new ProctorUserEntity({
    id: "proctor-1",
    moodleUserId: 10,
    username: "proctor_room1",
    passwordHash: "$argon2id$hashed",
    fullName: "Pengawas Ruang 1",
    role: "PROCTOR",
    roomNumber: "R.101",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const activeSession = new ProctorSessionEntity({
    id: "sess-1",
    token: "bearer-token-xyz",
    proctorId: "proctor-1",
    expiresAt: new Date(Date.now() + 10000000),
    createdAt: new Date(),
  });

  const createMockRepo = (): AuthRepositoryContract => ({
    findByUsername: vi.fn(),
    findById: vi.fn(),
    findSessionByToken: vi.fn(),
    createSession: vi.fn().mockResolvedValue(undefined),
    deleteSession: vi.fn().mockResolvedValue(undefined),
  });

  const createMockTokenProvider = (): AuthTokenProviderContract => ({
    generateToken: vi.fn().mockResolvedValue("generated-token-jwt"),
    verifyToken: vi.fn().mockResolvedValue({
      proctorId: "proctor-1",
      username: "proctor_room1",
      role: "PROCTOR",
      roomNumber: "R.101",
    }),
  });

  const createMockHasher = (): PasswordHasherContract => ({
    hash: vi.fn(),
    verify: vi.fn(),
  });

  describe("LoginUseCase", () => {
    it("harus berhasil login dan menerbitkan Bearer token saat kredensial cocok (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = createMockRepo();
      const mockToken = createMockTokenProvider();
      const mockHasher = createMockHasher();

      vi.spyOn(mockRepo, "findByUsername").mockResolvedValue(activeProctor);
      vi.spyOn(mockHasher, "verify").mockResolvedValue(true);

      const useCase = new LoginUseCase(mockRepo, mockToken, mockHasher);

      // Act
      const result = await useCase.execute({
        username: "proctor_room1",
        password: "ValidPassword123!",
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.data?.accessToken).toBe("generated-token-jwt");
      expect(result.data?.user.username).toBe("proctor_room1");
      expect(mockRepo.createSession).toHaveBeenCalled();
    });

    it("harus menolak login jika password salah (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = createMockRepo();
      const mockToken = createMockTokenProvider();
      const mockHasher = createMockHasher();

      vi.spyOn(mockRepo, "findByUsername").mockResolvedValue(activeProctor);
      vi.spyOn(mockHasher, "verify").mockResolvedValue(false);

      const useCase = new LoginUseCase(mockRepo, mockToken, mockHasher);

      // Act
      const result = await useCase.execute({
        username: "proctor_room1",
        password: "WrongPassword!",
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.statusCode).toBe(401);
      expect(mockRepo.createSession).not.toHaveBeenCalled();
    });
  });

  describe("LogoutUseCase", () => {
    it("harus menghapus sesi token aktif dari repository (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = createMockRepo();
      const useCase = new LogoutUseCase(mockRepo);

      // Act
      const result = await useCase.execute("valid-token");

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRepo.deleteSession).toHaveBeenCalledWith("valid-token");
    });
  });

  describe("GetCurrentSessionUseCase", () => {
    it("harus mengembalikan detail pengguna aktif berdasarkan token (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = createMockRepo();
      const mockToken = createMockTokenProvider();

      vi.spyOn(mockRepo, "findSessionByToken").mockResolvedValue(activeSession);
      vi.spyOn(mockRepo, "findById").mockResolvedValue(activeProctor);

      const useCase = new GetCurrentSessionUseCase(mockRepo, mockToken);

      // Act
      const result = await useCase.execute("bearer-token-xyz");

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.data?.id).toBe("proctor-1");
      expect(result.data?.roomNumber).toBe("R.101");
    });
  });
});
