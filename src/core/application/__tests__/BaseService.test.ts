//Files: src/core/application/__tests__/BaseService.test.ts
import {describe, expect, it} from "vitest";
import {BaseService} from "@/core/application/base/BaseService";
import type {AppResult} from "@/core/application/result/AppResult";

class TestProctorAuditService extends BaseService {
  public async performAuditedOperation(
    shouldFail: boolean,
  ): Promise<AppResult<string>> {
    return this.handleExecution(async () => {
      if (shouldFail) {
        throw new Error("Audit hash integrity mismatch.");
      }
      return "Audit verifikasi SHA-256 berhasil diverifikasi.";
    });
  }
}

describe("BaseService", () => {
  it("harus menangani eksekusi berhasil dan membungkusnya dalam AppResult sukses (AAA Pattern)", async () => {
    // Arrange
    const service = new TestProctorAuditService();

    // Act
    const result = await service.performAuditedOperation(false);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.data).toBe("Audit verifikasi SHA-256 berhasil diverifikasi.");
    expect(result.statusCode).toBe(200);
  });

  it("harus menangkap unhandled error dan mengubahnya menjadi AppResult failure (AAA Pattern)", async () => {
    // Arrange
    const service = new TestProctorAuditService();

    // Act
    const result = await service.performAuditedOperation(true);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.statusCode).toBe(500);
    expect(result.error).toBe("Audit hash integrity mismatch.");
  });
});
