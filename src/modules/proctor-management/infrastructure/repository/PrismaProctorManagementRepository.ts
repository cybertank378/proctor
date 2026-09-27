//Files: src/modules/proctor-management/infrastructure/repository/PrismaProctorManagementRepository.ts
import type { ProctorRole } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import type { ProctorManagementRepositoryContract } from "../../domain/contract/ProctorManagementRepositoryContract";
import { ProctorUserEntity } from "../../domain/entity/ProctorUserEntity";
import { ProctorManagementQueryBuilder } from "../builder/ProctorManagementQueryBuilder";

export class PrismaProctorManagementRepository
  implements ProctorManagementRepositoryContract
{
  public async findById(id: string): Promise<ProctorUserEntity | null> {
    const record = await prisma.proctorUser.findUnique({ where: { id } });
    return record ? new ProctorUserEntity(record) : null;
  }

  public async findByUsername(
    username: string,
  ): Promise<ProctorUserEntity | null> {
    const record = await prisma.proctorUser.findUnique({ where: { username } });
    return record ? new ProctorUserEntity(record) : null;
  }

  public async findByMoodleUserId(
    moodleUserId: number,
  ): Promise<ProctorUserEntity | null> {
    const record = await prisma.proctorUser.findUnique({
      where: { moodleUserId },
    });
    return record ? new ProctorUserEntity(record) : null;
  }

  public async create(data: {
    username: string;
    passwordHash: string;
    fullName: string;
    role: ProctorRole;
    roomNumber: string | null;
    moodleUserId: number | null;
  }): Promise<ProctorUserEntity> {
    const record = await prisma.proctorUser.create({ data });
    return new ProctorUserEntity(record);
  }

  public async updateRoom(
    id: string,
    roomNumber: string | null,
  ): Promise<ProctorUserEntity> {
    const record = await prisma.proctorUser.update({
      where: { id },
      data: { roomNumber },
    });
    return new ProctorUserEntity(record);
  }

  public async list(
    roomNumber?: string,
  ): Promise<readonly ProctorUserEntity[]> {
    const where = ProctorManagementQueryBuilder.buildListFilter(roomNumber);
    const records = await prisma.proctorUser.findMany({
      where,
      orderBy: { fullName: "asc" },
    });
    return records.map((r) => new ProctorUserEntity(r));
  }
}
