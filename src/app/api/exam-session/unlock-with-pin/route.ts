import { NextResponse } from "next/server";
import { AttemptStatus } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { MoodleGuardRpcClient } from "@/modules/exam-monitoring/infrastructure/rpc/MoodleGuardRpcClient";
import { PinGenerator } from "@/shared/helpers/PinGenerator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, pin } = body;

    if (!attemptId || !pin) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap." },
        { status: 400 },
      );
    }

    // Ambil data attempt dari Prisma untuk mendapatkan quizId
    const attemptRecord = await prisma.examAttemptRecord.findFirst({
      where: { attemptId: Number(attemptId) },
    });

    if (!attemptRecord) {
      return NextResponse.json(
        { success: false, message: "Attempt tidak ditemukan." },
        { status: 404 },
      );
    }

    // Validasi PIN
    const expectedPin = PinGenerator.generateForAttempt(
      Number(attemptId),
      attemptRecord.quizId,
    );

    console.info(
      `[UNLOCK-WITH-PIN] Request Buka Kunci: Attempt #${attemptId}, Input PIN: "${pin}", Expected PIN: "${expectedPin}"`
    );

    if (String(pin).trim() !== String(expectedPin).trim()) {
      console.warn(
        `[UNLOCK-WITH-PIN] ❌ PIN tidak cocok: Input "${pin}" !== Expected "${expectedPin}"`
      );
      return NextResponse.json(
        { success: false, message: "PIN tidak valid." },
        { status: 403 },
      );
    }

    // Buka kunci di Moodle RPC secara defensif (non-blocking)
    try {
      const rpcClient = new MoodleGuardRpcClient();
      const rpcResult = await rpcClient.unlockStudentAttempt({
        quizId: attemptRecord.quizId,
        userId: attemptRecord.userId,
        attemptId: Number(attemptId),
        unlockedByProctorMoodleId: 0, // 0 = sistem/PIN
      });

      if (!rpcResult.success) {
        console.warn(
          `[UNLOCK-WITH-PIN] Peringatan Moodle RPC (dilewati): ${rpcResult.message}`
        );
      }
    } catch (rpcErr) {
      console.warn("[UNLOCK-WITH-PIN] Gagal sync ke Moodle RPC:", rpcErr);
    }

    // Buka kunci di database lokal dan reset pelanggaran
    await prisma.examAttemptRecord.updateMany({
      where: { attemptId: Number(attemptId) },
      data: {
        isLockedByProctor: false,
        status: AttemptStatus.IN_PROGRESS,
        violationCount: 0,
        unlockedByProctorId: "PIN-UNLOCK",
      },
    });

    console.info(
      `[UNLOCK-WITH-PIN] ✅ Sesi Attempt #${attemptId} berhasil dibuka dengan PIN!`
    );

    return NextResponse.json({
      success: true,
      message: "Kunci berhasil dibuka dengan PIN.",
    });
  } catch (error) {
    console.error("[Unlock PIN] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 },
    );
  }
}
