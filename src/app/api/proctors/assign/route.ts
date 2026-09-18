//Files: src/app/api/proctors/assign/route.ts
import type {NextRequest} from "next/server";
import {ProctorManagementFactory} from "@/modules/proctor-management/infrastructure/factory/ProctorManagementFactory";

export async function POST(req: NextRequest): Promise<Response> {
    const body = (await req.json().catch(() => ({}))) as unknown;
    return ProctorManagementFactory.createHttpHandler().handle({
        headers: req.headers,
        url: req.url,
        method: "POST",
        body,
    });
}