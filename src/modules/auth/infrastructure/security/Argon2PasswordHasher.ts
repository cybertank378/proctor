//Files: src/modules/auth/infrastructure/security/Argon2PasswordHasher.ts
import * as argon2 from "argon2";
import type { PasswordHasherContract } from "../../domain/contract/PasswordHasherContract";

export class Argon2PasswordHasher implements PasswordHasherContract {
  public async hash(plainText: string): Promise<string> {
    if (!plainText || !plainText.trim()) {
      throw new Error("Teks kata sandi tidak boleh kosong.");
    }

    return argon2.hash(plainText, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  public async verify(plainText: string, hash: string): Promise<boolean> {
    if (!plainText || !hash) {
      return false;
    }

    try {
      return await argon2.verify(hash, plainText);
    } catch {
      return false;
    }
  }
}
