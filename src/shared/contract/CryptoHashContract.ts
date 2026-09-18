//Files: src/shared/contract/CryptoHashContract.ts
export interface CryptoHashContract {
    computeSha256(data: Buffer | Uint8Array | string): string;
    verifySha256(data: Buffer | Uint8Array | string, expectedHash: string): boolean;
}