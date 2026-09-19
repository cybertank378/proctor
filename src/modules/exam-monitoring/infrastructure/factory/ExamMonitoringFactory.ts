// src/modules/exam-monitoring/infrastructure/factory/ExamMonitoringFactory.ts
import {AuthFactory} from "@/modules/auth/infrastructure/factory/AuthFactory";
import {ExamMonitoringService} from "../../application/service/ExamMonitoringService";
import {GetActiveAttemptsUseCase} from "../../application/usecase/GetActiveAttemptsUseCase";
import {GetActiveQuizUseCase} from "../../application/usecase/GetActiveQuizUseCase";
import {UnlockExamAttemptUseCase} from "../../application/usecase/UnlockExamAttemptUseCase";
import {ExamMonitoringHttpHandler} from "../http/ExamMonitoringHttpHandler";
import {PrismaExamMonitoringRepository} from "../repository/PrismaExamMonitoringRepository";
import {MoodleGuardRpcClient} from "../rpc/MoodleGuardRpcClient";

export class ExamMonitoringFactory {
    private static httpHandlerInstance: ExamMonitoringHttpHandler | null = null;

    public static createRepository(): PrismaExamMonitoringRepository {
        return new PrismaExamMonitoringRepository();
    }

    public static createRpcClient(): MoodleGuardRpcClient {
        return new MoodleGuardRpcClient();
    }

    public static createGetActiveAttemptsUseCase(): GetActiveAttemptsUseCase {
        return new GetActiveAttemptsUseCase(ExamMonitoringFactory.createRepository());
    }

    public static createGetActiveQuizUseCase(): GetActiveQuizUseCase {
        return new GetActiveQuizUseCase(
            ExamMonitoringFactory.createRepository(),
            ExamMonitoringFactory.createRpcClient()
        );
    }

    public static createUnlockExamAttemptUseCase(): UnlockExamAttemptUseCase {
        return new UnlockExamAttemptUseCase(
            ExamMonitoringFactory.createRepository(),
            ExamMonitoringFactory.createRpcClient()
        );
    }

    public static createService(): ExamMonitoringService {
        return new ExamMonitoringService(
            ExamMonitoringFactory.createGetActiveAttemptsUseCase(),
            ExamMonitoringFactory.createGetActiveQuizUseCase()
        );
    }

    public static createHttpHandler(): ExamMonitoringHttpHandler {
        if (!ExamMonitoringFactory.httpHandlerInstance) {
            ExamMonitoringFactory.httpHandlerInstance = new ExamMonitoringHttpHandler(
                ExamMonitoringFactory.createService(),
                ExamMonitoringFactory.createUnlockExamAttemptUseCase(),
                async (token: string) => {
                    const sessionUseCase = AuthFactory.createGetCurrentSessionUseCase();
                    const sessionResult = await sessionUseCase.execute(token);
                    if (sessionResult.isFailure || !sessionResult.data) return null;
                    return AuthFactory.createRepository().findById(sessionResult.data.id);
                }
            );
        }
        return ExamMonitoringFactory.httpHandlerInstance;
    }

    public static reset(): void {
        ExamMonitoringFactory.httpHandlerInstance = null;
    }
}