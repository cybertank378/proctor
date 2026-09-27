//Files: src/app/api/monitoring/attempts/route.ts
import type { NextRequest } from "next/server";
import { ExamMonitoringFactory } from "@/modules/exam-monitoring/infrastructure/factory/ExamMonitoringFactory";

export async function GET(req: NextRequest): Promise<Response> {
  return ExamMonitoringFactory.createHttpHandler().handle({
    headers: req.headers,
    url: req.url,
    method: "GET",
  });
}
