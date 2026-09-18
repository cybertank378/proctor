//Files: src/modules/auth/domain/policy/AuthPolicy.ts
import type {ProctorUserEntity} from "../entity/ProctorUserEntity";

export const AuthPolicy = {
  canAuthenticate(user: ProctorUserEntity | null): boolean {
    if (!user) return false;
    return user.isActive;
  },

  canManageAllRooms(user: ProctorUserEntity): boolean {
    return user.isChiefProctor() && user.isActive;
  },
};
