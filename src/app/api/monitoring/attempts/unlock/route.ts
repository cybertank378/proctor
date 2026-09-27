//Files: src/app/api/monitoring/attempts/unlock/route.ts
import type { NextRequest } from "next/server";
import { ExamMonitoringFactory } from "@/modules/exam-monitoring/infrastructure/factory/ExamMonitoringFactory";

export async function POST(req: NextRequest): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as unknown;

  return ExamMonitoringFactory.createHttpHandler().handle({
    headers: req.headers,
    url: req.url,
    method: "POST",
    body,
  });
}
