//Files: src/modules/auth/__tests__/infrastructure/Providers.test.ts
import { describe, expect, it } from "vitest";
import { Argon2PasswordHasher } from "@/modules/auth/infrastructure/security/Argon2PasswordHasher";
import { BearerTokenProvider } from "@/modules/auth/infrastructure/security/BearerTokenProvider";

describe("Infrastructure Security Providers Suite", () => {
  const secretKey = "super-secret-key-at-least-32-bytes-long!";

  describe("Argon2PasswordHasher", () => {
    const hasher = new Argon2PasswordHasher();

    it("harus melakukan hashing dan verifikasi kata sandi dengan benar (AAA Pattern)", async () => {
      // Arrange
      const raw = "SecurePass123!";

      // Act
      const hash = await hasher.hash(raw);
      const isMatched = await hasher.verify(raw, hash);
      const isWrongMatched = await hasher.verify("WrongPass!", hash);

      // Assert
      expect(hash.startsWith("$argon2id")).toBe(true);
      expect(isMatched).toBe(true);
      expect(isWrongMatched).toBe(false);
    });

    it("harus melempar error jika teks kata sandi kosong (AAA Pattern)", async () => {
      // Arrange, Act & Assert
      await expect(hasher.hash("   ")).rejects.toThrow(
        "Teks kata sandi tidak boleh kosong.",
      );
    });
  });

  describe("BearerTokenProvider", () => {
    const provider = new BearerTokenProvider(secretKey);

    it("harus menerbitkan token JWT dan mendekode kembali klaim data (AAA Pattern)", async () => {
      // Arrange
      const payload = {
        proctorId: "p-101",
        username: "proctor_test",
        role: "PROCTOR" as const,
        roomNumber: "Lab 1",
      };

      // Act
      const token = await provider.generateToken(payload, "1h");
      const decoded = await provider.verifyToken(token);

      // Assert
      expect(typeof token).toBe("string");
      expect(decoded.proctorId).toBe("p-101");
      expect(decoded.roomNumber).toBe("Lab 1");
    });

    it("harus menolak token dengan tanda tangan salah (AAA Pattern)", async () => {
      // Arrange
      const otherProvider = new BearerTokenProvider(
        "different-secret-key-at-least-32-chars!",
      );
      const token = await otherProvider.generateToken({
        proctorId: "p-101",
        username: "proctor_test",
        role: "PROCTOR",
        roomNumber: null,
      });

      // Act & Assert
      await expect(provider.verifyToken(token)).rejects.toThrow(
        "Token tidak valid atau signature salah.",
      );
    });

    it("harus menolak secret key yang kurang dari 32 karakter (AAA Pattern)", () => {
      // Arrange, Act & Assert
      expect(() => new BearerTokenProvider("short-secret")).toThrow(
        "JWT Secret key minimal harus memiliki 32 karakter.",
      );
    });
  });
});
