//Files: src/core/infrastructure/http/HttpRequest.ts
export interface HttpRequest<
  TBody = unknown,
  TQuery = Record<string, string | undefined>,
> {
  readonly headers: Headers;
  readonly url: string;
  readonly method: string;
  readonly body?: TBody;
  readonly query?: TQuery;
  readonly params?: Record<string, string>;
}
