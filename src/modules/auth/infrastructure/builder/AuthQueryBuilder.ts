//Files: src/modules/auth/infrastructure/builder/AuthQueryBuilder.ts
export const AuthQueryBuilder = {
  byActiveUsername(username: string) {
    return {
      username: username.trim(),
      isActive: true,
    };
  },

  byValidSessionToken(token: string, currentDate: Date = new Date()) {
    return {
      token: token.trim(),
      expiresAt: {
        gt: currentDate,
      },
    };
  },
};
