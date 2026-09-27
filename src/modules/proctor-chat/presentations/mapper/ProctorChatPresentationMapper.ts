//Files: src/modules/proctor-chat/infrastructure/presentations/mapper/ProctorChatPresentationMapper.ts

import type { ChatMessageDto } from "../../domain/dto/ChatResponseDto";
import type { ProctorChatMessageEntity } from "../../domain/entity/ProctorChatMessageEntity";

export const ProctorChatPresentationMapper = {
  toDto(entity: ProctorChatMessageEntity): ChatMessageDto {
    return {
      id: entity.id,
      quizId: entity.quizId,
      roomNumber: entity.roomNumber,
      senderId: entity.senderId,
      senderName: entity.senderName,
      role: entity.role,
      content: entity.content,
      createdAt: entity.createdAt.toISOString(),
    };
  },
};
