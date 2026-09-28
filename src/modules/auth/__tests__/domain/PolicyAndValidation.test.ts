//Files: src/modules/auth/__tests__/domain/PolicyAndValidation.test.ts
import { describe, expect, it } from "vitest";
import { ProctorUserEntity } from "../../domain/entity/ProctorUserEntity";
import { AuthPolicy } from "../../domain/policy/AuthPolicy";
import { AuthError } from "../../domain/validation/AuthError";
import { AuthValidator } from "../../domain/validation/AuthValidator";

describe("Policy & Validation Suite", () => {
  describe("AuthValidator", () => {
    it("harus meloloskan kredensial valid (AAA Pattern)", () => {
      // Arrange, Act & Assert
      expect(() =>
        AuthValidator.validateLogin("proctor", "password123"),
      ).not.toThrow();
      expect(() => AuthValidator.validateToken("valid-token")).not.toThrow();
    });

    it("harus melempar AuthError 400 jika kredensial login kosong (AAA Pattern)", () => {
      // Arrange, Act & Assert
      expect(() => AuthValidator.validateLogin("", "pwd")).toThrow(AuthError);
      expect(() => AuthValidator.validateLogin("user", "   ")).toThrow(
        AuthError,
      );
    });

    it("harus melempar AuthError 401 jika token kosong (AAA Pattern)", () => {
      // Arrange, Act & Assert
      expect(() => AuthValidator.validateToken("   ")).toThrow(AuthError);
    });
  });

  describe("AuthPolicy", () => {
    const user = new ProctorUserEntity({
      id: "u-1",
      moodleUserId: null,
      username: "user1",
      passwordHash: "hash",
      fullName: "User 1",
      role: "PROCTOR",
      roomNumber: "R1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("harus mengizinkan otentikasi hanya untuk pengguna aktif (AAA Pattern)", () => {
      // Arrange & Act
      const activeAllowed = AuthPolicy.canAuthenticate(user);
      const nullAllowed = AuthPolicy.canAuthenticate(null);
      const inactiveUser = new ProctorUserEntity({ ...user, isActive: false });
      const inactiveAllowed = AuthPolicy.canAuthenticate(inactiveUser);

      // Assert
      expect(activeAllowed).toBe(true);
      expect(nullAllowed).toBe(false);
      expect(inactiveAllowed).toBe(false);
    });

    it("harus mengevaluasi wewenang lintas ruangan hanya untuk CHIEF_PROCTOR aktif (AAA Pattern)", () => {
      // Arrange
      const chief = new ProctorUserEntity({
        ...user,
        role: "CHIEF_PROCTOR",
        roomNumber: null,
      });
      const inactiveChief = new ProctorUserEntity({
        ...chief,
        isActive: false,
      });

      // Act & Assert
      expect(AuthPolicy.canManageAllRooms(chief)).toBe(true);
      expect(AuthPolicy.canManageAllRooms(user)).toBe(false);
      expect(AuthPolicy.canManageAllRooms(inactiveChief)).toBe(false);
    });
  });
});
