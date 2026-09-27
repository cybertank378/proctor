//Files: src/modules/auth/infrastructure/http/AuthHttpHandler.ts
import { BaseHttpHandler } from "@/core/infrastructure/http/BaseHttpHandler";
import type { HttpRequest } from "@/core/infrastructure/http/HttpRequest";
import { HttpResponse } from "@/core/infrastructure/http/HttpResponse";
import type { GetCurrentSessionUseCase } from "../../application/usecase/GetCurrentSessionUseCase";
import type { LoginUseCase } from "../../application/usecase/LoginUseCase";
import type { LogoutUseCase } from "../../application/usecase/LogoutUseCase";
import type { LoginRequestDto } from "../../domain/dto/AuthRequestDto";
import type { AuthHttpContract } from "./AuthHttpContract";

export class AuthHttpHandler
  extends BaseHttpHandler
  implements AuthHttpContract
{
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getSessionUseCase: GetCurrentSessionUseCase,
  ) {
    super();
  }

  public async handleLogin(req: HttpRequest): Promise<Response> {
    const body = req.body as LoginRequestDto;
    const result = await this.loginUseCase.execute(body);

    if (result.isFailure || !result.data) {
      return HttpResponse.success(
        { error: result.error },
        result.error,
        result.statusCode,
      );
    }

    // 1. Buat respons sukses dari HttpResponse bawaan
    const response = HttpResponse.success(
      result.data,
      result.message,
      result.statusCode,
    );

    // 2. Pasang HttpOnly Cookie agar terbaca langsung oleh src/proxy.ts saat navigasi ke /monitoring
    const isProduction = process.env.NODE_ENV === "production";
    const maxAgeSeconds = 60 * 60 * 8; // 8 jam

    response.headers.append(
      "Set-Cookie",
      `proctor_access_token=${result.data.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${
        isProduction ? "; Secure" : ""
      }`,
    );

    return response;
  }

  public async handleLogout(req: HttpRequest): Promise<Response> {
    const auth = this.getAuthenticatedProctor(req);
    const result = await this.logoutUseCase.execute(auth.token);

    if (result.isFailure) {
      return HttpResponse.success(
        { error: result.error },
        result.error,
        result.statusCode,
      );
    }

    const response = HttpResponse.success(undefined, result.message, 200);

    // Hapus cookie saat logout
    response.headers.append(
      "Set-Cookie",
      "proctor_access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    );

    return response;
  }

  public async handleCurrentSession(req: HttpRequest): Promise<Response> {
    const auth = this.getAuthenticatedProctor(req);
    const result = await this.getSessionUseCase.execute(auth.token);

    if (result.isFailure) {
      return HttpResponse.success(
        { error: result.error },
        result.error,
        result.statusCode,
      );
    }
    return HttpResponse.success(result.data, undefined, 200);
  }

  protected async process(req: HttpRequest): Promise<Response> {
    if (req.method === "POST") return this.handleLogin(req);
    if (req.method === "GET") return this.handleCurrentSession(req);
    if (req.method === "DELETE") return this.handleLogout(req);
    return HttpResponse.success(
      { error: "Metode tidak diizinkan." },
      undefined,
      405,
    );
  }
}
