//Files: src/core/infrastructure/http/__tests__/HttpInfrastructure.test.ts
import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "@/core/domain/error/UnauthorizedError";
import { ValidationError } from "@/core/domain/error/ValidationError";
import { BaseHttpHandler } from "../BaseHttpHandler";
import { HttpAuthentication } from "../HttpAuthentication";
import type { HttpRequest } from "../HttpRequest";
import { HttpResponse } from "../HttpResponse";
import { RouteErrorHandler } from "../RouteErrorHandler";

describe("HttpAuthentication", () => {
  it("harus berhasil mengekstrak token bearer dari header Authorization yang valid (AAA Pattern)", () => {
    // Arrange
    const rawToken = "super-secure-bearer-token-123";
    const headers = new Headers({
      authorization: `Bearer ${rawToken}`,
    });

    // Act
    const extractedToken = HttpAuthentication.extractBearerToken(headers);

    // Assert
    expect(extractedToken).toBe(rawToken);
  });

  it("harus melempar UnauthorizedError jika header Authorization tidak ada atau bukan format Bearer (AAA Pattern)", () => {
    // Arrange
    const headersWithoutAuth = new Headers();
    const headersInvalidFormat = new Headers({
      authorization: "Basic dXNlcjpwYXNz",
    });

    // Act & Assert
    expect(() =>
      HttpAuthentication.extractBearerToken(headersWithoutAuth),
    ).toThrow(UnauthorizedError);
    expect(() =>
      HttpAuthentication.extractBearerToken(headersInvalidFormat),
    ).toThrow(UnauthorizedError);
  });
});

describe("HttpResponse", () => {
  it("harus menghasilkan NextResponse sukses dengan struktur data yang konsisten (AAA Pattern)", async () => {
    // Arrange
    const payload = { room: "Lab 01", activeQuizzes: 3 };
    const message = "Data pengerjaan berhasil dimuat";

    // Act
    const response = HttpResponse.success(payload, message, 200);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(payload);
    expect(body.message).toBe(message);
  });

  it("harus menghasilkan NextResponse paginasi dengan struktur meta yang tepat (AAA Pattern)", async () => {
    // Arrange
    const items = [{ id: "violation-1" }, { id: "violation-2" }];
    const meta = {
      page: 1,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

    // Act
    const response = HttpResponse.paginated(items, meta, "Daftar pelanggaran");
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(items);
    expect(body.meta).toEqual(meta);
  });
});

describe("RouteErrorHandler", () => {
  it("harus memetakan ValidationError dengan statusCode 422 dan field errors (AAA Pattern)", async () => {
    // Arrange
    const validationError = new ValidationError("Data tidak valid", {
      reason: "Alasan pembatalan diskualifikasi wajib diisi",
    });

    // Act
    const response = RouteErrorHandler.handle(validationError);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Data tidak valid");
    expect(body.error.details).toEqual({
      reason: "Alasan pembatalan diskualifikasi wajib diisi",
    });
  });

  it("harus memetakan unhandled generic error menjadi Internal Server Error 500 (AAA Pattern)", async () => {
    // Arrange
    const genericError = new Error("Database connection timeout");

    // Act
    const response = RouteErrorHandler.handle(genericError);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Terjadi kegagalan internal pada server.");
  });
});

describe("BaseHttpHandler", () => {
  class TestHandler extends BaseHttpHandler {
    protected async process(req: HttpRequest): Promise<Response> {
      const auth = this.getAuthenticatedProctor(req);
      return HttpResponse.success({ proctorToken: auth.token });
    }
  }

  it("harus mengeksekusi method handler secara aman dan menangani otentikasi (AAA Pattern)", async () => {
    // Arrange
    const handler = new TestHandler();
    const mockRequest: HttpRequest = {
      headers: new Headers({ authorization: "Bearer valid-token-abc" }),
      url: "https://example.com/api/proctor/live",
      method: "GET",
    };

    // Act
    const response = await handler.handle(mockRequest);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.data.proctorToken).toBe("valid-token-abc");
  });

  it("harus menangkap error otentikasi dan mengembalikan status 401 via RouteErrorHandler (AAA Pattern)", async () => {
    // Arrange
    const handler = new TestHandler();
    const mockRequest: HttpRequest = {
      headers: new Headers(),
      url: "https://example.com/api/proctor/live",
      method: "GET",
    };

    // Act
    const response = await handler.handle(mockRequest);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });
});
