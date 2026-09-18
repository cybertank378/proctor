//Files: src/app/api/auth/login/route.ts
import type {NextRequest} from "next/server";
import {AuthFactory} from "@/modules/auth/infrastructure/factory/AuthFactory";

export async function POST(req: NextRequest): Promise<Response> {
    const body = (await req.json().catch(() => ({}))) as unknown;

    return AuthFactory.getLoginHandler().handle({
        headers: req.headers,
        url: req.url,
        method: "POST",
        body,
    });
}

export async function DELETE(req: NextRequest): Promise<Response> {
    return AuthFactory.getLoginHandler().handle({
        headers: req.headers,
        url: req.url,
        method: "DELETE",
    });
}