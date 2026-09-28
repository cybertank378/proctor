// Files: src/modules/exam-monitoring/infrastructure/factory/ExamMonitoringFactory.ts

import { AuthFactory } from "@/modules/auth/infrastructure/factory/AuthFactory";
import { ExamMonitoringService } from "../../application/service/ExamMonitoringService";
import { GetActiveAttemptsUseCase } from "../../application/usecase/GetActiveAttemptsUseCase";
import { GetActiveQuizUseCase } from "../../application/usecase/GetActiveQuizUseCase";
import { ListActiveQuizzesUseCase } from "../../application/usecase/ListActiveQuizzesUseCase";
import { UnlockExamAttemptUseCase } from "../../application/usecase/UnlockExamAttemptUseCase";
import { ExamMonitoringHttpHandler } from "../http/ExamMonitoringHttpHandler";
import { PrismaExamMonitoringRepository } from "../repository/PrismaExamMonitoringRepository";
import { MoodleGuardRpcClient } from "../rpc/MoodleGuardRpcClient";

let httpHandlerInstance: ExamMonitoringHttpHandler | null = null;

export const ExamMonitoringFactory = {
  createRepository(): PrismaExamMonitoringRepository {
    return new PrismaExamMonitoringRepository();
  },

  createRpcClient(): MoodleGuardRpcClient {
    return new MoodleGuardRpcClient();
  },

  createGetActiveAttemptsUseCase(): GetActiveAttemptsUseCase {
    return new GetActiveAttemptsUseCase(
      ExamMonitoringFactory.createRepository(),
      ExamMonitoringFactory.createRpcClient(),
    );
  },

  createGetActiveQuizUseCase(): GetActiveQuizUseCase {
    return new GetActiveQuizUseCase(
      ExamMonitoringFactory.createRepository(),
      ExamMonitoringFactory.createRpcClient(),
    );
  },

  createListActiveQuizzesUseCase(): ListActiveQuizzesUseCase {
    return new ListActiveQuizzesUseCase(
      ExamMonitoringFactory.createRpcClient(),
    );
  },

  createUnlockExamAttemptUseCase(): UnlockExamAttemptUseCase {
    return new UnlockExamAttemptUseCase(
      ExamMonitoringFactory.createRepository(),
      ExamMonitoringFactory.createRpcClient(),
    );
  },

  createService(): ExamMonitoringService {
    return new ExamMonitoringService(
      ExamMonitoringFactory.createGetActiveAttemptsUseCase(),
      ExamMonitoringFactory.createGetActiveQuizUseCase(),
      ExamMonitoringFactory.createListActiveQuizzesUseCase(),
    );
  },

  createHttpHandler(): ExamMonitoringHttpHandler {
    return new ExamMonitoringHttpHandler(
      ExamMonitoringFactory.createService(),
      ExamMonitoringFactory.createUnlockExamAttemptUseCase(),
      async (token: string) => {
        const sessionUseCase = AuthFactory.createGetCurrentSessionUseCase();
        const sessionResult = await sessionUseCase.execute(token);
        if (sessionResult.isFailure || !sessionResult?.data) return null;
        return AuthFactory.createRepository().findById(sessionResult.data.id);
      },
    );
  },

  reset(): void {
    httpHandlerInstance = null;
  },
} as const;
