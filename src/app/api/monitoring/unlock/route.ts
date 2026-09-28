// Files: src/app/api/monitoring/unlock/route.ts
import type { NextRequest } from "next/server";
import { ExamMonitoringFactory } from "@/modules/exam-monitoring/infrastructure/factory/ExamMonitoringFactory";

export async function POST(req: NextRequest): Promise<Response> {
  const handler = ExamMonitoringFactory.createHttpHandler();
  const body = await req.json().catch(() => ({}));

  return handler.handle({
    headers: req.headers,
    url: req.url,
    method: "POST",
    body,
  });
}
