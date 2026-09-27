//Files: src/core/application/__tests__/BaseUseCase.test.ts
import { describe, expect, it } from "vitest";
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";

interface MockInputDto {
  targetRoom: string;
}

interface MockOutputDto {
  activeExamsCount: number;
}

class TestExamMonitoringUseCase extends BaseUseCase<
  MockInputDto,
  MockOutputDto
> {
  async execute(input: MockInputDto): Promise<AppResult<MockOutputDto>> {
    if (!input.targetRoom) {
      return AppResultFactory.failure("Nomor ruangan wajib dicantumkan.", 400);
    }

    return AppResultFactory.success({ activeExamsCount: 5 });
  }
}

describe("BaseUseCase", () => {
  it("harus mengembalikan AppResult sukses ketika usecase dijalankan dengan parameter valid (AAA Pattern)", async () => {
    // Arrange
    const useCase = new TestExamMonitoringUseCase();
    const input: MockInputDto = { targetRoom: "Lab Komputer 1" };

    // Act
    const response = await useCase.execute(input);

    // Assert
    expect(response.isSuccess).toBe(true);
    expect(response.data?.activeExamsCount).toBe(5);
  });

  it("harus mengembalikan AppResult failure ketika validasi usecase gagal (AAA Pattern)", async () => {
    // Arrange
    const useCase = new TestExamMonitoringUseCase();
    const input: MockInputDto = { targetRoom: "" };

    // Act
    const response = await useCase.execute(input);

    // Assert
    expect(response.isFailure).toBe(true);
    expect(response.statusCode).toBe(400);
    expect(response.error).toBe("Nomor ruangan wajib dicantumkan.");
  });
});
