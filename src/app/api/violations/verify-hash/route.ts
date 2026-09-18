//Files: src/app/api/violations/verify-hash/route.ts
import type {NextRequest} from "next/server";
import {ViolationFactory} from "@/modules/violations/infrastructure/factory/ViolationFactory";

export async function POST(req: NextRequest): Promise<Response> {
    const body = (await req.json().catch(() => ({}))) as unknown;

    return ViolationFactory.createHttpHandler().handle({
        headers: req.headers,
        url: req.url,
        method: "POST",
        body,
    });
}