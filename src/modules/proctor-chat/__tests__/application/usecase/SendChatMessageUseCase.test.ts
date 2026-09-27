//Files: src/modules/proctor-chat/__tests__/application/usecase/SendChatMessageUseCase.test.ts
import { describe, expect, it, vi } from "vitest";
import { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import { SendChatMessageUseCase } from "@/modules/proctor-chat/application/usecase/SendChatMessageUseCase";
import type { ProctorChatMessageEntity } from "@/modules/proctor-chat/domain/entity/ProctorChatMessageEntity";

describe("SendChatMessageUseCase (Application Layer Suite)", () => {
  const proctor = new ProctorUserEntity({
    id: "proctor-uuid-1",
    moodleUserId: null,
    username: "proctor_lab1",
    passwordHash: "$argon2id$mock",
    fullName: "Budi Utomo",
    role: "PROCTOR",
    roomNumber: "Lab 01",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const chief = new ProctorUserEntity({
    id: "chief-uuid-1",
    moodleUserId: null,
    username: "chief_exam",
    passwordHash: "$argon2id$mock",
    fullName: "Ketua Pengawas",
    role: "CHIEF_PROCTOR",
    roomNumber: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe("Positive Cases", () => {
    it("harus mengikat chat pengawas reguler ke nomor ruangannya (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = {
        create: vi
          .fn()
          .mockImplementation(async (msg: ProctorChatMessageEntity) => msg),
        findRecentByQuiz: vi.fn(),
        deleteOlderThan: vi.fn(),
      };
      const useCase = new SendChatMessageUseCase(mockRepo);

      // Act
      const result = await useCase.execute({
        dto: { quizId: 10, content: "Kondisi ruangan tertib." },
        sender: proctor,
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data?.roomNumber).toBe("Lab 01");
      expect(result.data?.senderName).toBe("Budi Utomo");
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    it("harus mengizinkan CHIEF_PROCTOR mengirim pesan siaran/broadcast ke seluruh ruangan (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = {
        create: vi
          .fn()
          .mockImplementation(async (msg: ProctorChatMessageEntity) => msg),
        findRecentByQuiz: vi.fn(),
        deleteOlderThan: vi.fn(),
      };
      const useCase = new SendChatMessageUseCase(mockRepo);

      // Act
      const result = await useCase.execute({
        dto: {
          quizId: 10,
          content: "Peringatan waktu ujian tersisa 15 menit.",
          roomNumber: null,
        },
        sender: chief,
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.data?.roomNumber).toBeNull();
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("Negative Cases", () => {
    it("harus gagal jika konten pesan kosong (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = {
        create: vi.fn(),
        findRecentByQuiz: vi.fn(),
        deleteOlderThan: vi.fn(),
      };
      const useCase = new SendChatMessageUseCase(mockRepo);

      // Act
      const result = await useCase.execute({
        dto: { quizId: 10, content: "     " },
        sender: proctor,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain("tidak boleh kosong");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("harus gagal jika quizId bernilai <= 0 (AAA Pattern)", async () => {
      // Arrange
      const mockRepo = {
        create: vi.fn(),
        findRecentByQuiz: vi.fn(),
        deleteOlderThan: vi.fn(),
      };
      const useCase = new SendChatMessageUseCase(mockRepo);

      // Act
      const result = await useCase.execute({
        dto: { quizId: -1, content: "Pesan valid" },
        sender: proctor,
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.statusCode).toBe(400);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
