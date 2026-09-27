//Files: src/modules/auth/presentations/mapper/AuthPresentationMapper.ts
import type {
  CurrentSessionResponseDto,
  LoginResponseDto,
} from "../../domain/dto/AuthResponseDto";
import type { ProctorUserEntity } from "../../domain/entity/ProctorUserEntity";

export const AuthPresentationMapper = {
  toLoginResponse(
    user: ProctorUserEntity,
    accessToken: string,
    expiresAt: Date,
  ): LoginResponseDto {
    return {
      tokenType: "Bearer",
      accessToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        roomNumber: user.roomNumber,
      },
    };
  },

  toCurrentSession(user: ProctorUserEntity): CurrentSessionResponseDto {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      roomNumber: user.roomNumber,
      moodleUserId: user.moodleUserId,
    };
  },
};
