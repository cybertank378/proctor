//Files: src/core/infrastructure/http/HttpResponse.ts
import {NextResponse} from "next/server";
import type {PaginatedMetaContract} from "@/core/domain/contract/PaginatedResultContract";

export interface StandardApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly meta?: PaginatedMetaContract;
}

export const HttpResponse = {
  success<T>(
    data: T,
    message?: string,
    statusCode = 200,
  ): NextResponse<StandardApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status: statusCode },
    );
  },

  paginated<T>(
    items: readonly T[],
    meta: PaginatedMetaContract,
    message?: string,
    statusCode = 200,
  ): NextResponse<StandardApiResponse<readonly T[]>> {
    return NextResponse.json(
      {
        success: true,
        message,
        data: items,
        meta,
      },
      { status: statusCode },
    );
  },

  noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  },
};
