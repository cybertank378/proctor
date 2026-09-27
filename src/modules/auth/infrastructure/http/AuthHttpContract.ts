//Files: src/modules/auth/infrastructure/http/AuthHttpContract.ts
import type { HttpRequest } from "@/core/infrastructure/http/HttpRequest";

export interface AuthHttpContract {
  handleLogin(req: HttpRequest): Promise<Response>;
  handleLogout(req: HttpRequest): Promise<Response>;
  handleCurrentSession(req: HttpRequest): Promise<Response>;
}
