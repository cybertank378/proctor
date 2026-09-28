//Files: src/modules/auth/infrastructure/factory/AuthFactory.ts
import { AuthSessionService } from "../../application/service/AuthSessionService";
import { GetCurrentSessionUseCase } from "../../application/usecase/GetCurrentSessionUseCase";
import { LoginUseCase } from "../../application/usecase/LoginUseCase";
import { LogoutUseCase } from "../../application/usecase/LogoutUseCase";
import { AuthHttpHandler } from "../http/AuthHttpHandler";
import { PrismaAuthRepository } from "../repository/PrismaAuthRepository";
import { Argon2PasswordHasher } from "../security/Argon2PasswordHasher";
import { BearerTokenProvider } from "../security/BearerTokenProvider";

export class AuthFactory {
  // Cache singleton handler per-proses runtime
  private static loginHandlerInstance: AuthHttpHandler | null = null;
  private static sessionHandlerInstance: AuthHttpHandler | null = null;

  // Repositories & Providers (Lazy)
  public static createRepository(): PrismaAuthRepository {
    return new PrismaAuthRepository();
  }

  public static createTokenProvider(): BearerTokenProvider {
    return new BearerTokenProvider();
  }

  public static createPasswordHasher(): Argon2PasswordHasher {
    return new Argon2PasswordHasher();
  }

  // Use Cases (Lazy)
  public static createLoginUseCase(): LoginUseCase {
    return new LoginUseCase(
      AuthFactory.createRepository(),
      AuthFactory.createTokenProvider(),
      AuthFactory.createPasswordHasher(),
    );
  }

  public static createLogoutUseCase(): LogoutUseCase {
    return new LogoutUseCase(AuthFactory.createRepository());
  }

  public static createGetCurrentSessionUseCase(): GetCurrentSessionUseCase {
    return new GetCurrentSessionUseCase(
      AuthFactory.createRepository(),
      AuthFactory.createTokenProvider(),
    );
  }

  public static createSessionService(): AuthSessionService {
    return new AuthSessionService(AuthFactory.createGetCurrentSessionUseCase());
  }

  // HTTP Handlers (Menggantikan properti monolitik authModule)
  public static getLoginHandler(): AuthHttpHandler {
    if (!AuthFactory.loginHandlerInstance) {
      AuthFactory.loginHandlerInstance = new AuthHttpHandler(
        AuthFactory.createLoginUseCase(),
        AuthFactory.createLogoutUseCase(),
        AuthFactory.createGetCurrentSessionUseCase(),
      );
    }
    return AuthFactory.loginHandlerInstance;
  }

  public static getSessionHandler(): AuthHttpHandler {
    if (!AuthFactory.sessionHandlerInstance) {
      AuthFactory.sessionHandlerInstance = new AuthHttpHandler(
        AuthFactory.createLoginUseCase(),
        AuthFactory.createLogoutUseCase(),
        AuthFactory.createGetCurrentSessionUseCase(),
      );
    }
    return AuthFactory.sessionHandlerInstance;
  }

  public static reset(): void {
    AuthFactory.loginHandlerInstance = null;
    AuthFactory.sessionHandlerInstance = null;
  }
}
