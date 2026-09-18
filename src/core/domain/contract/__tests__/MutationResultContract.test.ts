//Files: src/core/domain/contract/__tests__/MutationResultContract.test.ts
import {describe, expect, it} from "vitest";
import type {MutationResultContract} from "../MutationResultContract";

describe("MutationResultContract", () => {
  it("harus merepresentasikan hasil mutasi sukses dengan identitas entitas yang terdampak (AAA Pattern)", () => {
    // Arrange
    const affectedId = "uuid-attempt-99";
    const affectedCount = 1;

    // Act
    const mutationResult: MutationResultContract = {
      isSuccess: true,
      affectedId,
      affectedCount,
      timestamp: new Date("2026-09-17T00:00:00.000Z"),
    };

    // Assert
    expect(mutationResult.isSuccess).toBe(true);
    expect(mutationResult.affectedId).toBe(affectedId);
    expect(mutationResult.affectedCount).toBe(1);
    expect(mutationResult.errorMessage).toBeUndefined();
  });

  it("harus merepresentasikan hasil mutasi gagal dengan pesan kegagalan (AAA Pattern)", () => {
    // Arrange
    const errorMessage = "Attempt siswa tidak ditemukan atau sudah selesai.";

    // Act
    const mutationResult: MutationResultContract = {
      isSuccess: false,
      affectedCount: 0,
      errorMessage,
      timestamp: new Date("2026-09-17T00:00:00.000Z"),
    };

    // Assert
    expect(mutationResult.isSuccess).toBe(false);
    expect(mutationResult.affectedId).toBeUndefined();
    expect(mutationResult.affectedCount).toBe(0);
    expect(mutationResult.errorMessage).toBe(errorMessage);
  });
});
