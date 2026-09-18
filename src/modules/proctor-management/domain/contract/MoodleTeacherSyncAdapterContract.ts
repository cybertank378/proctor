//Files: src/modules/proctor-management/domain/contract/MoodleTeacherSyncAdapterContract.ts
import type {MoodleTeacherRawDto} from "../dto/ProctorManagementResponseDto";

export interface MoodleTeacherSyncAdapterContract {
    fetchTeachers(): Promise<readonly MoodleTeacherRawDto[]>;
}