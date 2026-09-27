import { type NextRequest, NextResponse } from "next/server";
import { proctoringStreamManager } from "@/modules/live-proctoring/infrastructure/event/ProctoringStreamManager";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const quizIdParam = searchParams.get("quizId");
  const quizId = quizIdParam ? Number(quizIdParam) : undefined;

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial connection event
      sendEvent({
        type: "CONNECTED",
        message: "SSE connected for proctoring stream",
      });

      // Subscribe to live frames
      const unsubscribe = proctoringStreamManager.subscribe((frame) => {
        sendEvent({ type: "FRAME", data: frame });
      }, quizId);

      // Keep alive mechanism
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(":\n\n")); // SSE comment
      }, 30000);

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*", // Or specify exact origin
    },
  });
}
