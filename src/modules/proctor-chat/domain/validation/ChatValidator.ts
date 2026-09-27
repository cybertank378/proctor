//Files: src/modules/proctor-chat/validation/ChatValidator.ts
import { AppError } from "@/core/domain/error/AppError";

export const ChatValidator = {
  validateContent(content: string): string {
    const normalized = content ? content.trim() : "";
    if (!normalized) {
      throw new AppError("Pesan chat koordinasi tidak boleh kosong.", 400);
    }
    if (normalized.length > 500) {
      throw new AppError(
        "Panjang pesan chat tidak boleh melebihi 500 karakter.",
        400,
      );
    }
    return normalized;
  },

  validateQuizId(quizId: number): void {
    if (!Number.isInteger(quizId) || quizId <= 0) {
      throw new AppError("quizId harus berupa bilangan bulat positif.", 400);
    }
  },

  validateLimit(limit: number): number {
    if (!Number.isInteger(limit) || limit < 1) {
      return 50;
    }
    return Math.min(limit, 100);
  },
};
