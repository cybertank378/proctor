// src/modules/proctor-chat/infrastructure/factory/ProctorChatFactory.ts
import { AuthFactory } from "@/modules/auth/infrastructure/factory/AuthFactory";
import { ProctorChatService } from "../../application/service/ProctorChatService";
import { GetRecentChatMessagesUseCase } from "../../application/usecase/GetRecentChatMessagesUseCase";
import { PruneExpiredChatMessagesUseCase } from "../../application/usecase/PruneExpiredChatMessagesUseCase";
import { SendChatMessageUseCase } from "../../application/usecase/SendChatMessageUseCase";
import { ProctorChatHttpHandler } from "../http/ProctorChatHttpHandler";
import { PrismaProctorChatRepository } from "../repository/PrismaProctorChatRepository";

let httpHandlerInstance: ProctorChatHttpHandler | null = null;

export const ProctorChatFactory = {
  createRepository(): PrismaProctorChatRepository {
    return new PrismaProctorChatRepository();
  },

  createSendUseCase(): SendChatMessageUseCase {
    return new SendChatMessageUseCase(ProctorChatFactory.createRepository());
  },

  createGetMessagesUseCase(): GetRecentChatMessagesUseCase {
    return new GetRecentChatMessagesUseCase(
      ProctorChatFactory.createRepository(),
    );
  },

  createPruneUseCase(): PruneExpiredChatMessagesUseCase {
    return new PruneExpiredChatMessagesUseCase(
      ProctorChatFactory.createRepository(),
    );
  },

  createService(): ProctorChatService {
    return new ProctorChatService(
      ProctorChatFactory.createSendUseCase(),
      ProctorChatFactory.createGetMessagesUseCase(),
      ProctorChatFactory.createPruneUseCase(),
    );
  },

  createHttpHandler(): ProctorChatHttpHandler {
    if (!httpHandlerInstance) {
      httpHandlerInstance = new ProctorChatHttpHandler(
        ProctorChatFactory.createService(),
        async (token: string) => {
          const sessionUseCase = AuthFactory.createGetCurrentSessionUseCase();
          const sessionResult = await sessionUseCase.execute(token);
          if (sessionResult.isFailure || !sessionResult.data) return null;
          return AuthFactory.createRepository().findById(sessionResult.data.id);
        },
      );
    }
    return httpHandlerInstance;
  },

  reset(): void {
    httpHandlerInstance = null;
  },
} as const;
