// Files: src/modules/auth/__tests__/infrastructure/PrismaAuthRepository.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/lib/prisma";
import { PrismaAuthRepository } from "../../infrastructure/repository/PrismaAuthRepository";

// Mock module @/lib/prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    proctorUser: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    proctorSession: {
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe("PrismaAuthRepository (Infrastructure Repository)", () => {
  let repo: PrismaAuthRepository;

  const mockDbUser = {
    id: "proctor-uuid-1",
    moodleUserId: 101,
    username: "proctor_lab1",
    passwordHash: "$argon2id$mock",
    fullName: "Ahmad Dahlan",
    role: "PROCTOR" as const,
    roomNumber: "Lab 1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDbSession = {
    id: "sess-1",
    token: "valid-token-123",
    proctorId: "proctor-uuid-1",
    expiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Inisialisasi tanpa argumen
    repo = new PrismaAuthRepository();
  });

  describe("Positive Cases", () => {
    it("harus mengembalikan ProctorUserEntity saat findByUsername menemukan data (AAA Pattern)", async () => {
      // Arrange
      vi.mocked(prisma.proctorUser.findFirst).mockResolvedValue(mockDbUser);

      // Act
      const result = await repo.findByUsername("proctor_lab1");

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe("proctor-uuid-1");
      expect(result?.username).toBe("proctor_lab1");
      expect(prisma.proctorUser.findFirst).toHaveBeenCalledTimes(1);
    });

    it("harus mengembalikan ProctorSessionEntity saat findSessionByToken menemukan data (AAA Pattern)", async () => {
      // Arrange
      vi.mocked(prisma.proctorSession.findFirst).mockResolvedValue(
        mockDbSession,
      );

      // Act
      const result = await repo.findSessionByToken("valid-token-123");

      // Assert
      expect(result).not.toBeNull();
      expect(result?.token).toBe("valid-token-123");
      expect(prisma.proctorSession.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe("Negative Cases", () => {
    it("harus mengembalikan null jika record tidak ditemukan (AAA Pattern)", async () => {
      // Arrange
      vi.mocked(prisma.proctorUser.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.proctorSession.findFirst).mockResolvedValue(null);

      // Act
      const user = await repo.findByUsername("unknown");
      const session = await repo.findSessionByToken("unknown-token");

      // Assert
      expect(user).toBeNull();
      expect(session).toBeNull();
    });
  });
});
