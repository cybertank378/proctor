//Files: src/core/domain/contract/__tests__/DataInvalidationContract.test.ts
import {describe, expect, it} from "vitest";
import type {DataInvalidationContract} from "../DataInvalidationContract";

class InMemoryCacheInvalidator implements DataInvalidationContract {
  private readonly invalidatedTags = new Set<string>();

  public async invalidate(tag: string): Promise<void> {
    this.invalidatedTags.add(tag);
  }

  public async invalidateMany(tags: readonly string[]): Promise<void> {
    for (const tag of tags) {
      this.invalidatedTags.add(tag);
    }
  }

  public isInvalidated(tag: string): boolean {
    return this.invalidatedTags.has(tag);
  }
}

describe("DataInvalidationContract", () => {
  it("harus mendaftarkan tag cache tunggal untuk diinvalidasi (AAA Pattern)", async () => {
    // Arrange
    const invalidator = new InMemoryCacheInvalidator();
    const tag = "quiz_attempts_room_lab_1";

    // Act
    await invalidator.invalidate(tag);

    // Assert
    expect(invalidator.isInvalidated(tag)).toBe(true);
  });

  it("harus mendaftarkan banyak tag sekaligus untuk diinvalidasi (AAA Pattern)", async () => {
    // Arrange
    const invalidator = new InMemoryCacheInvalidator();
    const tags = [
      "active_quizzes",
      "locked_students_all",
      "proctor_sessions",
    ] as const;

    // Act
    await invalidator.invalidateMany(tags);

    // Assert
    expect(invalidator.isInvalidated("active_quizzes")).toBe(true);
    expect(invalidator.isInvalidated("locked_students_all")).toBe(true);
    expect(invalidator.isInvalidated("proctor_sessions")).toBe(true);
  });
});
