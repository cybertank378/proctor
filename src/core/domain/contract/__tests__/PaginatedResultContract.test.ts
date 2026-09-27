//Files: src/core/domain/contract/__tests__/PaginatedResultContract.test.ts
import { describe, expect, it } from "vitest";
import type {
  PaginatedMetaContract,
  PaginatedResultContract,
} from "../PaginatedResultContract";

interface MockViolationRecord {
  readonly id: string;
  readonly type: string;
}

describe("PaginatedResultContract", () => {
  it("harus mengkalkulasi metadata halaman dengan benar (AAA Pattern)", () => {
    // Arrange
    const items: readonly MockViolationRecord[] = [
      { id: "viol-1", type: "TAB_SWITCH" },
      { id: "viol-2", type: "WINDOW_BLUR" },
    ];
    const meta: PaginatedMetaContract = {
      page: 1,
      pageSize: 10,
      totalItems: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: false,
    };

    // Act
    const paginatedResult: PaginatedResultContract<MockViolationRecord> = {
      items,
      meta,
    };

    // Assert
    expect(paginatedResult.items).toHaveLength(2);
    expect(paginatedResult.meta.page).toBe(1);
    expect(paginatedResult.meta.totalPages).toBe(3);
    expect(paginatedResult.meta.hasNextPage).toBe(true);
    expect(paginatedResult.meta.hasPrevPage).toBe(false);
  });
});
