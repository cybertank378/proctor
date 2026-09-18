// src/app/layout.tsx
import type {Metadata} from "next";
import {Inter} from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white`}
      >
        <AppUiProvider>{children}</AppUiProvider>
      </body>
    </html>
  );
}
