import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import type {
  LiveProctoringRepositoryContract,
  SaveStreamFrameDto,
  StreamFrameResultDto,
} from "../../domain/contract/LiveProctoringRepositoryContract";

export class PrismaLiveProctoringRepository
  implements LiveProctoringRepositoryContract
{
  public async saveFrame(
    dto: SaveStreamFrameDto
  ): Promise<StreamFrameResultDto> {
    const frameId = crypto.randomUUID();
    const fileName = `${frameId}.png`;
    const relativePath = `assets/images/streams/${fileName}`;
    const targetDir = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      "streams"
    );
    const absoluteFilePath = path.join(targetDir, fileName);

    let imagePath = "";

    // Save Base64 buffer
    if (dto.screenshotBase64 && dto.screenshotBase64.includes("base64,")) {
      try {
        const base64Data = dto.screenshotBase64.split("base64,")[1];
        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(absoluteFilePath, Buffer.from(base64Data, "base64"));
        imagePath = `/${relativePath}`;
      } catch (err) {
        console.warn("[LIVE PROCTORING] Gagal menyimpan frame PNG:", err);
      }
    } else {
        return { success: false, imagePath: "" };
    }

    // Save metadata to database (optional, can be skipped for pure SSE or kept for history)
    await prisma.proctoringStreamRecord.create({
      data: {
        id: frameId,
        attemptRecordId: dto.attemptRecordId,
        imagePath: relativePath,
        isSuspicious: dto.isSuspicious ?? false,
      },
    });

    return {
      success: true,
      imagePath,
    };
  }
}
