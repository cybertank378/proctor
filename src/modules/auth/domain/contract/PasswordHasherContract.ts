//Files: src/modules/auth/domain/contract/PasswordHasherContract.ts
export interface PasswordHasherContract {
  hash(plainText: string): Promise<string>;
  verify(plainText: string, hash: string): Promise<boolean>;
}