//Files: src/modules/proctor-chat/domain/__tests__/entity/ProctorChatMessageEntity.test.ts
import { describe, expect, it } from "vitest";
import { ProctorChatMessageEntity } from "@/modules/proctor-chat/domain/entity/ProctorChatMessageEntity";

describe("ProctorChatMessageEntity (Domain Entity Suite)", () => {
  const baseProps = {
    id: "chat-uuid-01",
    quizId: 10,
    roomNumber: "Lab Komputer 1",
    senderId: "proctor-uuid-101",
    senderName: "Budi Santoso",
    role: "PROCTOR" as const,
    content: "Siswa bangku 05 mengalami tab blur 2 kali.",
    createdAt: new Date("2026-09-18T08:00:00.000Z"),
  };

  describe("Positive Cases", () => {
    it("harus berhasil instansiasi entitas pesan ruang spesifik yang valid (AAA Pattern)", () => {
      // Arrange & Act
      const message = new ProctorChatMessageEntity(baseProps);

      // Assert
      expect(message.id).toBe("chat-uuid-01");
      expect(message.quizId).toBe(10);
      expect(message.isBroadcast()).toBe(false);
      expect(message.roomNumber).toBe("Lab Komputer 1");
      expect(message.isSentBy("proctor-uuid-101")).toBe(true);
    });

    it("harus mengenali pesan broadcast jika roomNumber bernilai null (AAA Pattern)", () => {
      // Arrange & Act
      const broadcastMessage = new ProctorChatMessageEntity({
        ...baseProps,
        roomNumber: null,
      });

      // Assert
      expect(broadcastMessage.isBroadcast()).toBe(true);
      expect(broadcastMessage.roomNumber).toBeNull();
    });
  });

  describe("Negative & Invariant Cases", () => {
    it("harus melempar error jika pesan kosong atau hanya berupa spasi (AAA Pattern)", () => {
      // Arrange, Act & Assert
      expect(
        () => new ProctorChatMessageEntity({ ...baseProps, content: "   " }),
      ).toThrow("Isi pesan koordinasi pengawas tidak boleh kosong.");
    });

    it("harus melempar error jika pesan melebihi batas 500 karakter (AAA Pattern)", () => {
      // Arrange
      const oversizedText = "x".repeat(501);

      // Act & Assert
      expect(
        () =>
          new ProctorChatMessageEntity({
            ...baseProps,
            content: oversizedText,
          }),
      ).toThrow("Isi pesan koordinasi melebihi batas toleransi 500 karakter.");
    });

    it("harus melempar error invariant jika quizId <= 0 atau senderId kosong (AAA Pattern)", () => {
      // Arrange, Act & Assert
      expect(
        () => new ProctorChatMessageEntity({ ...baseProps, quizId: 0 }),
      ).toThrow("ID kuis Moodle harus berupa bilangan bulat positif.");
      expect(
        () => new ProctorChatMessageEntity({ ...baseProps, senderId: "" }),
      ).toThrow("ID pengawas pengirim pesan tidak boleh kosong.");
    });
  });
});
