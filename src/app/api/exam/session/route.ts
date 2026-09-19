// Files: src/app/api/exam/session/route.ts
import type {NextRequest} from "next/server";
import {ExamSessionFactory} from "@/modules/exam-session/infrastructure/factory/ExamSessionFactory";

export async function GET(request: NextRequest): Promise<Response> {
  const handler = ExamSessionFactory.createHttpHandler();

  return handler.handle({
    method: "GET",
    url: request.url,
    headers: request.headers,
  });
}
