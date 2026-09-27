//Files: src/modules/auth/application/usecase/LoginUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { AuthRepositoryContract } from "../../domain/contract/AuthRepositoryContract";
import type { AuthTokenProviderContract } from "../../domain/contract/AuthTokenProviderContract";
import type { PasswordHasherContract } from "../../domain/contract/PasswordHasherContract";
import type { LoginRequestDto } from "../../domain/dto/AuthRequestDto";
import type { LoginResponseDto } from "../../domain/dto/AuthResponseDto";
import { AuthPolicy } from "../../domain/policy/AuthPolicy";
import { AuthValidator } from "../../domain/validation/AuthValidator";
import { AuthPresentationMapper } from "../../presentations/mapper/AuthPresentationMapper";

export class LoginUseCase extends BaseUseCase<
  LoginRequestDto,
  LoginResponseDto
> {
  constructor(
    private readonly authRepo: AuthRepositoryContract,
    private readonly tokenProvider: AuthTokenProviderContract,
    private readonly passwordHasher: PasswordHasherContract,
  ) {
    super();
  }

  public async execute(
    input: LoginRequestDto,
  ): Promise<AppResult<LoginResponseDto>> {
    try {
      AuthValidator.validateLogin(input.username, input.password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validasi data gagal.";
      return AppResultFactory.failure(msg, 400);
    }

    const proctor = await this.authRepo.findByUsername(input.username);
    if (!AuthPolicy.canAuthenticate(proctor)) {
      return AppResultFactory.failure("Kredensial pengawas tidak valid.", 401);
    }

    // Proctor terverifikasi tidak null melalui AuthPolicy.canAuthenticate
    const targetProctor = proctor!;

    const isMatch = await this.passwordHasher.verify(
      input.password,
      targetProctor.passwordHash,
    );
    if (!isMatch) {
      return AppResultFactory.failure("Kredensial pengawas tidak valid.", 401);
    }

    const token = await this.tokenProvider.generateToken({
      proctorId: targetProctor.id,
      username: targetProctor.username,
      role: targetProctor.role,
      roomNumber: targetProctor.roomNumber,
    });

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // Masa berlaku 8 jam
    await this.authRepo.createSession(targetProctor.id, token, expiresAt);

    const responseDto = AuthPresentationMapper.toLoginResponse(
      targetProctor,
      token,
      expiresAt,
    );
    return AppResultFactory.success(
      responseDto,
      "Autentikasi pengawas berhasil.",
    );
  }
}
