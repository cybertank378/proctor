//Files: src/modules/proctor-chat/application/service/ProctorChatService.ts
import { BaseService } from "@/core/application/base/BaseService";
import type { AppResult } from "@/core/application/result/AppResult";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import type {
  GetChatMessagesFilterDto,
  PruneChatMessagesRequestDto,
  SendChatMessageRequestDto,
} from "../../domain/dto/ChatRequestDto";
import type {
  ChatMessageDto,
  PruneChatMessagesResultDto,
} from "../../domain/dto/ChatResponseDto";
import type { GetRecentChatMessagesUseCase } from "../usecase/GetRecentChatMessagesUseCase";
import type { PruneExpiredChatMessagesUseCase } from "../usecase/PruneExpiredChatMessagesUseCase";
import type { SendChatMessageUseCase } from "../usecase/SendChatMessageUseCase";

export class ProctorChatService extends BaseService {
  constructor(
    private readonly sendUseCase: SendChatMessageUseCase,
    private readonly getMessagesUseCase: GetRecentChatMessagesUseCase,
    private readonly pruneUseCase: PruneExpiredChatMessagesUseCase,
  ) {
    super();
  }

  public async sendMessage(
    dto: SendChatMessageRequestDto,
    sender: ProctorUserEntity,
  ): Promise<AppResult<ChatMessageDto>> {
    return this.sendUseCase.execute({ dto, sender });
  }

  public async getMessages(
    filter: GetChatMessagesFilterDto,
    proctor: ProctorUserEntity,
  ): Promise<AppResult<readonly ChatMessageDto[]>> {
    return this.getMessagesUseCase.execute({ filter, proctor });
  }

  public async pruneExpired(
    dto: PruneChatMessagesRequestDto = {},
  ): Promise<AppResult<PruneChatMessagesResultDto>> {
    return this.pruneUseCase.execute(dto);
  }
}
