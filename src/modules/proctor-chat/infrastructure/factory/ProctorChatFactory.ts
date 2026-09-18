//Files: src/modules/proctor-chat/infrastructure/factory/ProctorChatFactory.ts
import {AuthFactory} from "@/modules/auth/infrastructure/factory/AuthFactory";
import {GetRecentChatMessagesUseCase} from "../../application/usecase/GetRecentChatMessagesUseCase";
import {PruneExpiredChatMessagesUseCase} from "../../application/usecase/PruneExpiredChatMessagesUseCase";
import {SendChatMessageUseCase} from "../../application/usecase/SendChatMessageUseCase";
import {ProctorChatService} from "../../application/service/ProctorChatService";
import {ProctorChatHttpHandler} from "../http/ProctorChatHttpHandler";
import {PrismaProctorChatRepository} from "../repository/PrismaProctorChatRepository";

export class ProctorChatFactory {
    private static httpHandlerInstance: ProctorChatHttpHandler | null = null;

    public static createRepository(): PrismaProctorChatRepository {
        return new PrismaProctorChatRepository();
    }

    public static createSendUseCase(): SendChatMessageUseCase {
        return new SendChatMessageUseCase(ProctorChatFactory.createRepository());
    }

    public static createGetMessagesUseCase(): GetRecentChatMessagesUseCase {
        return new GetRecentChatMessagesUseCase(ProctorChatFactory.createRepository());
    }

    public static createPruneUseCase(): PruneExpiredChatMessagesUseCase {
        return new PruneExpiredChatMessagesUseCase(ProctorChatFactory.createRepository());
    }

    public static createService(): ProctorChatService {
        return new ProctorChatService(
            ProctorChatFactory.createSendUseCase(),
            ProctorChatFactory.createGetMessagesUseCase(),
            ProctorChatFactory.createPruneUseCase()
        );
    }

    public static createHttpHandler(): ProctorChatHttpHandler {
        if (!ProctorChatFactory.httpHandlerInstance) {
            ProctorChatFactory.httpHandlerInstance = new ProctorChatHttpHandler(
                ProctorChatFactory.createService(),
                async (token: string) => {
                    const sessionUseCase = AuthFactory.createGetCurrentSessionUseCase();
                    const sessionResult = await sessionUseCase.execute(token);
                    if (sessionResult.isFailure || !sessionResult.data) return null;
                    return AuthFactory.createRepository().findById(sessionResult.data.id);
                }
            );
        }
        return ProctorChatFactory.httpHandlerInstance;
    }

    public static reset(): void {
        ProctorChatFactory.httpHandlerInstance = null;
    }
}