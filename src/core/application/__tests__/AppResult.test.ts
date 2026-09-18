//Files: src/core/application/__tests__/AppResult.test.ts
import {describe, expect, it} from "vitest";
import type {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";

describe("AppResult & AppResultFactory (Result Pattern)", () => {
  it("harus membuat result sukses dengan payload data yang tepat (AAA Pattern)", () => {
    // Arrange
    const payload = { id: "proctor-1", username: "pengawas_ruang_1" };
    const message = "Operasi berhasil dieksekusi.";

    // Act
    const result: AppResult<typeof payload> = AppResultFactory.success(
      payload,
      message,
      200,
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.data).toEqual(payload);
    expect(result.message).toBe(message);
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeUndefined();
  });

  it("harus membuat result gagal dengan pesan error dan status code yang sesuai (AAA Pattern)", () => {
    // Arrange
    const errorMessage = "Token pengawas tidak valid atau sudah kedaluwarsa.";
    const statusCode = 401;

    // Act
    const result = AppResultFactory.failure(errorMessage, statusCode);

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.data).toBeUndefined();
    expect(result.error).toBe(errorMessage);
    expect(result.statusCode).toBe(statusCode);
  });
});
