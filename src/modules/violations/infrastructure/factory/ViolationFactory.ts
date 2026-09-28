//Files: src/modules/violations/infrastructure/factory/ViolationFactory.ts
import { Sha256Checksum } from "@/shared/utils/Sha256Checksum";
import { ViolationAuditService } from "../../application/service/ViolationAuditService";
import { GetViolationsByAttemptUseCase } from "../../application/usecase/GetViolationsByAttemptUseCase";
import { RecordViolationUseCase } from "../../application/usecase/RecordViolationUseCase";
import { VerifyEvidenceIntegrityUseCase } from "../../application/usecase/VerifyEvidenceIntegrityUseCase";
import { ViolationHttpHandler } from "../http/ViolationHttpHandler";
import { PrismaViolationRepository } from "../repository/PrismaViolationRepository";

export class ViolationFactory {
  private static httpHandlerInstance: ViolationHttpHandler | null = null;

  public static createRepository(): PrismaViolationRepository {
    return new PrismaViolationRepository();
  }

  public static createCryptoUtil(): Sha256Checksum {
    return new Sha256Checksum();
  }

  public static createRecordViolationUseCase(): RecordViolationUseCase {
    return new RecordViolationUseCase(ViolationFactory.createRepository());
  }

  public static createGetViolationsByAttemptUseCase(): GetViolationsByAttemptUseCase {
    return new GetViolationsByAttemptUseCase(
      ViolationFactory.createRepository(),
    );
  }

  public static createVerifyIntegrityUseCase(): VerifyEvidenceIntegrityUseCase {
    return new VerifyEvidenceIntegrityUseCase(
      ViolationFactory.createRepository(),
      ViolationFactory.createCryptoUtil(),
    );
  }

  public static createService(): ViolationAuditService {
    return new ViolationAuditService(
      ViolationFactory.createRecordViolationUseCase(),
      ViolationFactory.createGetViolationsByAttemptUseCase(),
      ViolationFactory.createVerifyIntegrityUseCase(),
    );
  }

  public static createHttpHandler(): ViolationHttpHandler {
    if (!ViolationFactory.httpHandlerInstance) {
      ViolationFactory.httpHandlerInstance = new ViolationHttpHandler(
        ViolationFactory.createService(),
      );
    }
    return ViolationFactory.httpHandlerInstance;
  }

  public static reset(): void {
    ViolationFactory.httpHandlerInstance = null;
  }
}
