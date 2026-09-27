//Files: src/modules/auth/__tests__/presentation/AuthPresentationMapper.test.ts
import { describe, expect, it } from "vitest";
import { ProctorUserEntity } from "../../domain/entity/ProctorUserEntity";
import { AuthPresentationMapper } from "../../presentations/mapper/AuthPresentationMapper";

describe("AuthPresentationMapper Suite", () => {
  const user = new ProctorUserEntity({
    id: "proctor-1",
    moodleUserId: 50,
    username: "proctor_lead",
    passwordHash: "hash",
    fullName: "Lead Proctor",
    role: "CHIEF_PROCTOR",
    roomNumber: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("harus memetakan entitas ke LoginResponseDto secara presisi (AAA Pattern)", () => {
    // Arrange
    const expiresAt = new Date("2026-09-17T08:00:00.000Z");

    // Act
    const dto = AuthPresentationMapper.toLoginResponse(
      user,
      "bearer-token-val",
      expiresAt,
    );

    // Assert
    expect(dto.tokenType).toBe("Bearer");
    expect(dto.accessToken).toBe("bearer-token-val");
    expect(dto.expiresAt).toBe(expiresAt.toISOString());
    expect(dto.user.id).toBe("proctor-1");
    expect(dto.user.role).toBe("CHIEF_PROCTOR");
  });

  it("harus memetakan entitas ke CurrentSessionResponseDto (AAA Pattern)", () => {
    // Arrange & Act
    const dto = AuthPresentationMapper.toCurrentSession(user);

    // Assert
    expect(dto.id).toBe("proctor-1");
    expect(dto.moodleUserId).toBe(50);
    expect(dto.role).toBe("CHIEF_PROCTOR");
  });
});
