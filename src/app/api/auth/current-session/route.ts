//Files: src/app/api/auth/current-session/route.ts
import type {NextRequest} from "next/server";
import {AuthFactory} from "@/modules/auth/infrastructure/factory/AuthFactory";

export async function GET(req: NextRequest): Promise<Response> {
    return AuthFactory.getSessionHandler().handle({
        headers: req.headers,
        url: req.url,
        method: "GET",
    });
}