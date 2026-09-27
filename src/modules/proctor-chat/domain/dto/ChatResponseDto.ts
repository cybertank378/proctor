//Files: src/modules/proctor-chat/domain/dto/ChatResponseDto.ts
import type { ProctorRole } from "@/modules/auth/domain/entity/ProctorUserEntity";

export interface ChatMessageDto {
  readonly id: string;
  readonly quizId: number;
  readonly roomNumber: string | null;
  readonly senderId: string;
  readonly senderName: string;
  readonly role: ProctorRole;
  readonly content: string;
  readonly createdAt: string;
}

export interface PruneChatMessagesResultDto {
  readonly prunedCount: number;
  readonly cutoffDate: string;
}
