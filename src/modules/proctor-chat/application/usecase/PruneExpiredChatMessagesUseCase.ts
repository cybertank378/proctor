//Files: src/modules/proctor-chat/application/usecase/PruneExpiredChatMessagesUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import { AppConfig } from "@/shared/config/AppConfig";
import type { ProctorChatRepositoryContract } from "../../domain/contract/ProctorChatRepositoryContract";
import type { PruneChatMessagesRequestDto } from "../../domain/dto/ChatRequestDto";
import type { PruneChatMessagesResultDto } from "../../domain/dto/ChatResponseDto";
import { ChatRetentionPolicy } from "../../domain/policy/ChatRetentionPolicy";

export class PruneExpiredChatMessagesUseCase extends BaseUseCase<
  PruneChatMessagesRequestDto,
  PruneChatMessagesResultDto
> {
  constructor(private readonly repository: ProctorChatRepositoryContract) {
    super();
  }

  public async execute(
    input: PruneChatMessagesRequestDto = {},
  ): Promise<AppResult<PruneChatMessagesResultDto>> {
    const config = AppConfig.get();
    const days =
      input.retentionDays && input.retentionDays > 0
        ? input.retentionDays
        : config.chatRetentionDays;

    const cutoffDate = ChatRetentionPolicy.calculateCutoffDate(days);
    const count = await this.repository.deleteOlderThan(cutoffDate);

    return AppResultFactory.success(
      {
        prunedCount: count,
        cutoffDate: cutoffDate.toISOString(),
      },
      `Pembersihan selesai: ${count} pesan koordinasi kedaluwarsa dihapus.`,
    );
  }
}
