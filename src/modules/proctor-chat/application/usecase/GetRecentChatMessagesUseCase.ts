//Files: src/modules/proctor-chat/application/usecase/GetRecentChatMessagesUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import { RoomScopeHelper } from "@/shared/helpers/RoomScopeHelper";
import type { ProctorChatRepositoryContract } from "../../domain/contract/ProctorChatRepositoryContract";
import type { GetChatMessagesFilterDto } from "../../domain/dto/ChatRequestDto";
import type { ChatMessageDto } from "../../domain/dto/ChatResponseDto";
import { ChatValidator } from "../../domain/validation/ChatValidator";
import { ProctorChatPresentationMapper } from "../../presentations/mapper/ProctorChatPresentationMapper";

export interface GetMessagesContext {
  readonly filter: GetChatMessagesFilterDto;
  readonly proctor: ProctorUserEntity;
}

export class GetRecentChatMessagesUseCase extends BaseUseCase<
  GetMessagesContext,
  readonly ChatMessageDto[]
> {
  constructor(private readonly repository: ProctorChatRepositoryContract) {
    super();
  }

  public async execute(
    input: GetMessagesContext,
  ): Promise<AppResult<readonly ChatMessageDto[]>> {
    const { filter, proctor } = input;

    try {
      ChatValidator.validateQuizId(filter.quizId);
      const safeLimit = ChatValidator.validateLimit(filter.limit ?? 50);

      const targetRoom = RoomScopeHelper.resolveFilterRoom(
        proctor.role,
        proctor.roomNumber,
        filter.roomNumber,
      );

      const messages = await this.repository.findRecentByQuiz({
        quizId: filter.quizId,
        roomNumber: targetRoom,
        limit: safeLimit,
      });

      return AppResultFactory.success(
        messages.map(ProctorChatPresentationMapper.toDto),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat daftar riwayat obrolan.";
      return AppResultFactory.failure(msg, 400);
    }
  }
}
