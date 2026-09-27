//Files: src/modules/auth/domain/dto/AuthRequestDto.ts
export interface LoginRequestDto {
  readonly username: string;
  readonly password: string;
}

export interface RevokeTokenRequestDto {
  readonly token: string;
}
