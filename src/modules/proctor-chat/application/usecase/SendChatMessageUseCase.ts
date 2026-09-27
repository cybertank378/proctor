//Files: src/modules/proctor-chat/application/usecase/SendChatMessageUseCase.ts
import crypto from "node:crypto";
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import { ChatValidator } from "@/modules/proctor-chat/domain/validation/ChatValidator";
import { ProctorChatPresentationMapper } from "@/modules/proctor-chat/presentations/mapper/ProctorChatPresentationMapper";
import type { ProctorChatRepositoryContract } from "../../domain/contract/ProctorChatRepositoryContract";
import type { SendChatMessageRequestDto } from "../../domain/dto/ChatRequestDto";
import type { ChatMessageDto } from "../../domain/dto/ChatResponseDto";
import { ProctorChatMessageEntity } from "../../domain/entity/ProctorChatMessageEntity";

export interface SendMessageContext {
  readonly dto: SendChatMessageRequestDto;
  readonly sender: ProctorUserEntity;
}

export class SendChatMessageUseCase extends BaseUseCase<
  SendMessageContext,
  ChatMessageDto
> {
  constructor(private readonly repository: ProctorChatRepositoryContract) {
    super();
  }

  public async execute(
    input: SendMessageContext,
  ): Promise<AppResult<ChatMessageDto>> {
    const { dto, sender } = input;

    try {
      ChatValidator.validateQuizId(dto.quizId);
      const validatedContent = ChatValidator.validateContent(dto.content);

      // Tetapkan cakupan ruangan: Chief Proctor dapat memilih target/broadcast,
      // sedangkan Proctor reguler terikat ke ruang tugasnya
      const assignedRoom = sender.isChiefProctor()
        ? dto.roomNumber && dto.roomNumber.trim()
          ? dto.roomNumber.trim()
          : null
        : sender.roomNumber;

      const entity = new ProctorChatMessageEntity({
        id: crypto.randomUUID(),
        quizId: dto.quizId,
        roomNumber: assignedRoom,
        senderId: sender.id,
        senderName: sender.fullName,
        role: sender.role,
        content: validatedContent,
        createdAt: new Date(),
      });

      const saved = await this.repository.create(entity);

      return AppResultFactory.success(
        ProctorChatPresentationMapper.toDto(saved),
        "Pesan koordinasi pengawas berhasil terkirim.",
        201,
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengirim pesan chat pengawas.";
      return AppResultFactory.failure(msg, 400);
    }
  }
}
