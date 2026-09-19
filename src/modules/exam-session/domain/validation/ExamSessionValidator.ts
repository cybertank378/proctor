// Files: src/modules/exam-session/domain/validation/ExamSessionValidator.ts

import type {RecordViolationRequestDto} from "../dto/ExamSessionRequestDto";

export const ExamSessionValidator = {
  validateQuizId(quizId: unknown): number {
    const id = Number(quizId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID Kuis Moodle tidak valid atau belum ditentukan.");
    }
    return id;
  },

  validateAttemptId(attemptId: unknown): number {
    const id = Number(attemptId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID Attempt pengerjaan ujian tidak valid.");
    }
    return id;
  },

  validateViolationPayload(dto: RecordViolationRequestDto): void {
    this.validateQuizId(dto.quizId);
    if (!dto.violationType || dto.violationType.trim().length === 0) {
      throw new Error("Tipe insiden pelanggaran wajib disertakan.");
    }
    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new Error("Deskripsi insiden pelanggaran tidak boleh kosong.");
    }
  },
};
