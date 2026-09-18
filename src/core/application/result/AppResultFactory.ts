//Files: src/core/application/result/AppResultFactory.ts
import {AppResult} from "@/core/application/result/AppResult";

export const AppResultFactory = {
  success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
  ): AppResult<T> {
    return new AppResult<T>(true, statusCode, data, undefined, message);
  },

  failure<T>(error: string, statusCode: number = 400): AppResult<T> {
    return new AppResult<T>(false, statusCode, undefined, error);
  },
} as const;
