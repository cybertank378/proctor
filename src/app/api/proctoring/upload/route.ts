import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { proctoringStreamManager } from "@/modules/live-proctoring/infrastructure/event/ProctoringStreamManager";
import { PrismaLiveProctoringRepository } from "@/modules/live-proctoring/infrastructure/repository/PrismaLiveProctoringRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attemptRecordId, attemptId, quizId, userId, screenshotBase64 } =
      body;

    if (!quizId || !screenshotBase64) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let finalAttemptRecordId = attemptRecordId;

    if (!finalAttemptRecordId && attemptId) {
      // Find the record ID
      const record = await prisma.examAttemptRecord.findFirst({
        where: { attemptId: Number(attemptId) },
      });
      if (record) {
        finalAttemptRecordId = record.id;
      }
    }

    if (!finalAttemptRecordId) {
      // We cannot save frame without attempt record id
      return NextResponse.json(
        { error: "Attempt record not found" },
        { status: 404 },
      );
    }

    // 1. Validasi / AI Processing (Dummy/Light)
    // Di sini bisa ditambahkan verifikasi ringan (contoh: ukuran gambar, format)
    const isSuspicious = false;

    // 2. Simpan Gambar dan Metadata ke DB
    const repository = new PrismaLiveProctoringRepository();
    const result = await repository.saveFrame({
      attemptRecordId: finalAttemptRecordId,
      quizId: Number(quizId),
      userId: Number(userId),
      screenshotBase64,
      isSuspicious,
    });

    if (result.success) {
      // 3. Emit event SSE untuk dashboard pengawas
      proctoringStreamManager.pushFrame({
        attemptRecordId: finalAttemptRecordId,
        quizId: Number(quizId),
        userId: Number(userId),
        imagePath: result.imagePath,
        isSuspicious,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("[PROCTORING UPLOAD ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
