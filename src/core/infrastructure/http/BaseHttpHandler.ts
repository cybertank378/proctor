//Files: src/core/infrastructure/http/BaseHttpHandler.ts
import type { AuthenticatedProctorContext } from "./HttpAuthentication";
import { HttpAuthentication } from "./HttpAuthentication";
import type { HttpRequest } from "./HttpRequest";
import { RouteErrorHandler } from "./RouteErrorHandler";

export abstract class BaseHttpHandler {
  public async handle(req: HttpRequest): Promise<Response> {
    try {
      return await this.process(req);
    } catch (error: unknown) {
      return RouteErrorHandler.handle(error);
    }
  }

  protected abstract process(req: HttpRequest): Promise<Response>;

  protected getAuthenticatedProctor(
    req: HttpRequest,
  ): AuthenticatedProctorContext {
    return HttpAuthentication.resolveContext(req.headers);
  }
}
