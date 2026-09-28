//Files: src/core/infrastructure/http/RouteErrorHandler.ts
import { NextResponse } from "next/server";
import { AppError } from "@/core/domain/error/AppError";
import { ValidationError } from "@/core/domain/error/ValidationError";

export interface ErrorApiResponse {
  readonly success: false;
  readonly error: {
    readonly name: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

export const RouteErrorHandler = {
  handle(error: unknown): NextResponse<ErrorApiResponse> {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            name: error.name,
            message: error.message,
            details: error.errors,
          },
        },
        { status: error.statusCode },
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            name: error.name,
            message: error.message,
          },
        },
        { status: error.statusCode },
      );
    }

    // Default Fallback untuk Unhandled Exceptions
    return NextResponse.json(
      {
        success: false,
        error: {
          name: "InternalServerError",
          message: "Terjadi kegagalan internal pada server.",
        },
      },
      { status: 500 },
    );
  },
};
