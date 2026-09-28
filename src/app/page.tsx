// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThinkingOrb } from "thinking-orbs";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Verifikasi keberadaan token Bearer pengawas di client storage
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("proctor_access_token")
        : null;

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <ThinkingOrb state="connecting" size={64} />
        <p className="text-xs text-slate-500 font-medium">
          Memverifikasi sesi konsol pengawas...
        </p>
      </div>
    </main>
  );
}
