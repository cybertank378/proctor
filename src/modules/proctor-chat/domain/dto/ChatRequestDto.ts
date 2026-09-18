//Files: src/modules/proctor-chat/domain/dto/ChatRequestDto.ts
export interface SendChatMessageRequestDto {
    readonly quizId: number;
    readonly roomNumber?: string | null;
    readonly content: string;
}

export interface GetChatMessagesFilterDto {
    readonly quizId: number;
    readonly roomNumber?: string | null;
    readonly limit?: number;
}

export interface PruneChatMessagesRequestDto {
    readonly retentionDays?: number;
}