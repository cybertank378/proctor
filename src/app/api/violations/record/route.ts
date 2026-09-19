// Files: src/app/api/violations/record/route.ts
import type {NextRequest} from "next/server";
import {ExamSessionFactory} from "@/modules/exam-session/infrastructure/factory/ExamSessionFactory";

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
