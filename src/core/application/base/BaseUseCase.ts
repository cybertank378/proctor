//Files: src/core/application/base/BaseUseCase.ts
import type {AppResult} from "@/core/application/result/AppResult";

export abstract class BaseUseCase<TInput, TOutput> {
  abstract execute(input: TInput): Promise<AppResult<TOutput>>;
}
