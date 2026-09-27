//Files: src/modules/proctor-management/domain/dto/ProctorManagementResponseDto.ts
import type { ProctorRole } from "@/generated/prisma/enums";

export interface ProctorSummaryResponseDto {
  readonly id: string;
  readonly username: string;
  readonly fullName: string;
  readonly role: ProctorRole;
  readonly roomNumber: string | null;
  readonly isActive: boolean;
  readonly moodleUserId: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MoodleTeacherRawDto {
  readonly user_id: number;
  readonly username: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly email: string;
  readonly role_name: string;
  readonly course_name: string;
}
