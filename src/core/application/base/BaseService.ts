//Files: src/core/application/base/BaseService.ts

import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";

export abstract class BaseService {
  protected async handleExecution<T>(
    action: () => Promise<T>,
    successMessage?: string,
  ): Promise<AppResult<T>> {
    try {
      const data = await action();
      return AppResultFactory.success(data, successMessage, 200);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan internal pada layanan.";
      return AppResultFactory.failure<T>(errorMessage, 500);
    }
  }
}
