//Files: src/modules/proctor-chat/infrastructure/builder/ProctorChatQueryBuilder.ts
export const ProctorChatQueryBuilder  ={
    byQuizAndRoom(quizId: number, roomNumber?: string | null) {
        if (!roomNumber || !roomNumber.trim()) {
            return { quizId };
        }

        const normalizedRoom = roomNumber.trim();
        return {
            quizId,
            OR: [
                { roomNumber: normalizedRoom },
                { roomNumber: null }, // Pesan broadcast seluruh ruangan
            ],
        };
    },

    byCutoffDate(cutoffDate: Date) {
        return {
            createdAt: {
                lt: cutoffDate,
            },
        };
    }
}