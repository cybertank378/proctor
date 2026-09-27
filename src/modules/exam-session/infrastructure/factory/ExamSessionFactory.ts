// Files: src/modules/exam-session/infrastructure/factory/ExamSessionFactory.ts
import { ExamSessionService } from "../../application/service/ExamSessionService";
import { LockAttemptSessionUseCase } from "../../application/usecase/LockAttemptSessionUseCase";
import { RecordViolationUseCase } from "../../application/usecase/RecordViolationUseCase";
import { VerifyAttemptSessionUseCase } from "../../application/usecase/VerifyAttemptSessionUseCase";
import { MoodleQuizAdapter } from "../external/MoodleQuizAdapter";
import { ExamSessionHttpHandler } from "../http/ExamSessionHttpHandler";
import { PrismaExamSessionRepository } from "../repository/PrismaExamSessionRepository";

let httpHandlerInstance: ExamSessionHttpHandler | null = null;

export const ExamSessionFactory = {
  createRepository(): PrismaExamSessionRepository {
    return new PrismaExamSessionRepository();
  },

  createMoodleAdapter(): MoodleQuizAdapter {
    return new MoodleQuizAdapter();
  },

  createVerifySessionUseCase(): VerifyAttemptSessionUseCase {
    return new VerifyAttemptSessionUseCase(
      ExamSessionFactory.createRepository(),
      ExamSessionFactory.createMoodleAdapter(),
    );
  },

  createRecordViolationUseCase(): RecordViolationUseCase {
    return new RecordViolationUseCase(ExamSessionFactory.createRepository());
  },

  createLockAttemptUseCase(): LockAttemptSessionUseCase {
    return new LockAttemptSessionUseCase(ExamSessionFactory.createRepository());
  },

  createService(): ExamSessionService {
    return new ExamSessionService(
      ExamSessionFactory.createVerifySessionUseCase(),
      ExamSessionFactory.createRecordViolationUseCase(),
      ExamSessionFactory.createLockAttemptUseCase(),
    );
  },

  createHttpHandler(): ExamSessionHttpHandler {
    if (!httpHandlerInstance) {
      httpHandlerInstance = new ExamSessionHttpHandler(
        ExamSessionFactory.createService(),
      );
    }
    return httpHandlerInstance;
  },

  reset(): void {
    httpHandlerInstance = null;
  },
};
