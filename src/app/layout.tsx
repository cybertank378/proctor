// src/app/layout.tsx
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {headers} from "next/headers";
import "@/styles/globals.css";
import type React from "react";
import {AppUiProvider} from "@/shared-ui/provider/AppUiProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Exam Guard — Proctoring & Anti-Cheat Control Console",
  description:
    "Realtime Proctoring Engine, Automated Cheating Detection, and Moodle Exam Lock Remote Console",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil nonce kriptografis yang digenerate oleh proxy.ts per request
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? undefined;

  return (
    <html lang="id">
      <body
        nonce={nonce}
        className={`${inter.variable} min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white`}
      >
        <AppUiProvider>{children}</AppUiProvider>
      </body>
    </html>
  );
}
