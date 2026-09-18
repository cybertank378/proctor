//Files: src/modules/proctor-chat/domain/contract/ProctorChatRepositoryContract.ts
import type {ProctorChatMessageEntity} from "../entity/ProctorChatMessageEntity";

export interface ProctorChatRepositoryContract {
    create(message: ProctorChatMessageEntity): Promise<ProctorChatMessageEntity>;
    findRecentByQuiz(filter: {
        readonly quizId: number;
        readonly roomNumber?: string | null;
        readonly limit: number;
    }): Promise<readonly ProctorChatMessageEntity[]>;
    deleteOlderThan(cutoffDate: Date): Promise<number>;
}