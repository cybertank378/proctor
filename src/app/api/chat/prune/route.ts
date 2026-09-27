//Files: src/app/api/chat/prune/route.ts
import type { NextRequest } from "next/server";
import { ProctorChatFactory } from "@/modules/proctor-chat/infrastructure/factory/ProctorChatFactory";

export async function POST(req: NextRequest): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as unknown;

  return ProctorChatFactory.createHttpHandler().handle({
    headers: req.headers,
    url: req.url,
    method: "POST",
    body,
  });
}
