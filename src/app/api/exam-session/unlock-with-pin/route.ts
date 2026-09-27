import {NextResponse} from "next/server";
import {PinGenerator} from "@/shared/helpers/PinGenerator";
import {MoodleGuardRpcClient} from "@/modules/exam-monitoring/infrastructure/rpc/MoodleGuardRpcClient";
import prisma from "@/lib/prisma";
import {AttemptStatus} from "@/generated/prisma/enums";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, pin } = body;

    if (!attemptId || !pin) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap." },
        { status: 400 }
      );
    }

    // Ambil data attempt dari Prisma untuk mendapatkan quizId
    const attemptRecord = await prisma.examAttemptRecord.findFirst({
      where: { attemptId: Number(attemptId) }
    });

    if (!attemptRecord) {
      return NextResponse.json(
        { success: false, message: "Attempt tidak ditemukan." },
        { status: 404 }
      );
    }

    // Validasi PIN
    const expectedPin = PinGenerator.generateForAttempt(
      Number(attemptId),
      attemptRecord.quizId
    );

    if (pin !== expectedPin) {
      return NextResponse.json(
        { success: false, message: "PIN tidak valid." },
        { status: 403 }
      );
    }

    // Buka kunci di Moodle RPC (menggunakan ID pengawas sistem '0' atau bypass)
    const rpcClient = new MoodleGuardRpcClient();
    const rpcResult = await rpcClient.unlockStudentAttempt({
      quizId: attemptRecord.quizId,
      userId: attemptRecord.userId,
      attemptId: Number(attemptId),
      unlockedByProctorMoodleId: 0, // 0 = sistem/PIN
    });

    if (!rpcResult.success) {
      return NextResponse.json(
        { success: false, message: "Gagal membuka kunci di Moodle: " + rpcResult.message },
        { status: 500 }
      );
    }

    // Buka kunci di lokal
    await prisma.examAttemptRecord.updateMany({
      where: { attemptId: Number(attemptId) },
      data: {
        isLockedByProctor: false,
        status: AttemptStatus.IN_PROGRESS,
        unlockedByProctorId: "PIN-UNLOCK",
      }
    });

    return NextResponse.json({ success: true, message: "Kunci berhasil dibuka dengan PIN." });
  } catch (error) {
    console.error("[Unlock PIN] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
