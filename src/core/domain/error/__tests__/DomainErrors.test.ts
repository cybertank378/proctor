//Files: src/core/domain/error/__tests__/DomainErrors.test.ts
import { describe, expect, it } from "vitest";
import { AppError } from "../AppError";
import { ConflictError } from "../ConflictError";
import { ForbiddenError } from "../ForbiddenError";
import { InternalError } from "../InternalError";
import { NotFoundError } from "../NotFoundError";
import { UnauthorizedError } from "../UnauthorizedError";
import { ValidationError } from "../ValidationError";

describe("Domain Errors Suite", () => {
  it("harus membuat instance AppError sebagai root class dengan statusCode dan message yang sesuai (AAA Pattern)", () => {
    // Arrange
    const message = "Terjadi kegagalan proses domain.";
    const statusCode = 422;

    // Act
    const error = new AppError(message, statusCode);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("AppError");
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });

  it("harus membuat instance UnauthorizedError dengan statusCode 401 (AAA Pattern)", () => {
    // Arrange
    const message =
      "Bearer token pengawas wajib disertakan atau telah kedaluwarsa.";

    // Act
    const error = new UnauthorizedError(message);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("UnauthorizedError");
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe(message);
  });

  it("harus membuat instance ForbiddenError dengan statusCode 403 (AAA Pattern)", () => {
    // Arrange
    const message =
      "Pengawas tidak memiliki wewenang untuk membuka kunci ruangan ini.";

    // Act
    const error = new ForbiddenError(message);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("ForbiddenError");
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe(message);
  });

  it("harus membuat instance NotFoundError dengan statusCode 404 (AAA Pattern)", () => {
    // Arrange
    const message = "Attempt pengerjaan kuis siswa tidak ditemukan.";

    // Act
    const error = new NotFoundError(message);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("NotFoundError");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe(message);
  });

  it("harus membuat instance ConflictError dengan statusCode 409 (AAA Pattern)", () => {
    // Arrange
    const message = "Attempt kuis ini sudah dalam status LOCKED.";

    // Act
    const error = new ConflictError(message);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("ConflictError");
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe(message);
  });

  it("harus membuat instance ValidationError dengan statusCode 422 beserta payload fields (AAA Pattern)", () => {
    // Arrange
    const message = "Payload pelaporan pelanggaran tidak valid.";
    const validationFields = {
      violationType: "Tipe pelanggaran tidak dikenal.",
      sha256Hash: "Hash SHA-256 wajib terdiri dari 64 karakter heksadesimal.",
    };

    // Act
    const error = new ValidationError(message, validationFields);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("ValidationError");
    expect(error.statusCode).toBe(422);
    expect(error.message).toBe(message);
    expect(error.errors).toEqual(validationFields);
  });

  it("harus membuat instance InternalError dengan statusCode 500 (AAA Pattern)", () => {
    // Arrange
    const message = "Gagal memproses panggilan RPC Web Service Moodle.";

    // Act
    const error = new InternalError(message);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("InternalError");
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe(message);
  });
});
