//Files: src/modules/proctor-management/infrastructure/factory/ProctorManagementFactory.ts
import { AuthFactory } from "@/modules/auth/infrastructure/factory/AuthFactory";
import { Argon2PasswordHasher } from "@/modules/auth/infrastructure/security/Argon2PasswordHasher";
import { ProctorManagementService } from "../../application/service/ProctorManagementService";
import { AssignProctorRoomUseCase } from "../../application/usecase/AssignProctorRoomUseCase";
import { CreateProctorUseCase } from "../../application/usecase/CreateProctorUseCase";
import { ListProctorsUseCase } from "../../application/usecase/ListProctorsUseCase";
import { SyncMoodleTeachersUseCase } from "../../application/usecase/SyncMoodleTeachersUseCase";
import { MoodleTeacherSyncAdapter } from "../external/MoodleTeacherSyncAdapter";
import { ProctorManagementHttpHandler } from "../http/ProctorManagementHttpHandler";
import { PrismaProctorManagementRepository } from "../repository/PrismaProctorManagementRepository";

export class ProctorManagementFactory {
  private static httpHandlerInstance: ProctorManagementHttpHandler | null =
    null;
  private static passwordHasherInstance: Argon2PasswordHasher | null = null;

  public static createRepository(): PrismaProctorManagementRepository {
    return new PrismaProctorManagementRepository();
  }

  public static createMoodleSyncAdapter(): MoodleTeacherSyncAdapter {
    return new MoodleTeacherSyncAdapter();
  }

  public static createCreateUseCase(): CreateProctorUseCase {
    return new CreateProctorUseCase(
      ProctorManagementFactory.createRepository(),
      ProctorManagementFactory.getPasswordHasher(),
    );
  }

  public static createAssignUseCase(): AssignProctorRoomUseCase {
    return new AssignProctorRoomUseCase(
      ProctorManagementFactory.createRepository(),
    );
  }

  public static createListUseCase(): ListProctorsUseCase {
    return new ListProctorsUseCase(ProctorManagementFactory.createRepository());
  }

  public static createSyncUseCase(): SyncMoodleTeachersUseCase {
    return new SyncMoodleTeachersUseCase(
      ProctorManagementFactory.createMoodleSyncAdapter(),
      ProctorManagementFactory.createRepository(),
      ProctorManagementFactory.getPasswordHasher(),
    );
  }

  public static createService(): ProctorManagementService {
    return new ProctorManagementService(
      ProctorManagementFactory.createCreateUseCase(),
      ProctorManagementFactory.createAssignUseCase(),
      ProctorManagementFactory.createListUseCase(),
      ProctorManagementFactory.createSyncUseCase(),
    );
  }

  public static createHttpHandler(): ProctorManagementHttpHandler {
    if (!ProctorManagementFactory.httpHandlerInstance) {
      ProctorManagementFactory.httpHandlerInstance =
        new ProctorManagementHttpHandler(
          ProctorManagementFactory.createService(),
          async (token: string) => {
            const sessionUseCase = AuthFactory.createGetCurrentSessionUseCase();
            const sessionResult = await sessionUseCase.execute(token);
            if (sessionResult.isFailure || !sessionResult.data) return null;
            return AuthFactory.createRepository().findById(
              sessionResult.data.id,
            );
          },
        );
    }
    return ProctorManagementFactory.httpHandlerInstance;
  }

  public static reset(): void {
    ProctorManagementFactory.httpHandlerInstance = null;
    ProctorManagementFactory.passwordHasherInstance = null;
  }

  private static getPasswordHasher(): Argon2PasswordHasher {
    if (!ProctorManagementFactory.passwordHasherInstance) {
      ProctorManagementFactory.passwordHasherInstance =
        new Argon2PasswordHasher();
    }
    return ProctorManagementFactory.passwordHasherInstance;
  }
}
