// Files: src/app/api/exam-session/unlock-with-pin/route.ts
import type { NextRequest } from "next/server";
import { ExamSessionFactory } from "@/modules/exam-session/infrastructure/factory/ExamSessionFactory";

export async function POST(request: NextRequest): Promise<Response> {
  const handler = ExamSessionFactory.createHttpHandler();
  const body = await request.json().catch(() => ({}));

  return handler.handle({
    method: "POST",
    url: request.url,
    headers: request.headers,
    body,
  });
}

export async function GET(): Promise<Response> {
  return Response.json(
    {
      success: false,
      message:
        "Endpoint ini hanya menerima metode POST dengan format JSON { attemptId, pin }.",
    },
    { status: 405 },
  );
}
