//Files: src/sections/auth/organisms/LoginFormSection.tsx
"use client";

import {Eye, EyeOff, Lock, ShieldCheck, User} from "lucide-react";
import Image from "next/image";
import type React from "react";
import {useState} from "react";

import {useAuthApi} from "@/modules/auth/presentations/hook/useAuthApi";
import AuthTextField from "@/sections/auth/atoms/AuthTextField";
import BrandLogo from "@/sections/auth/atoms/BrandLogo";
import Button from "@/shared-ui/component/Button";
import {showErrorToast, showSuccessToast} from "@/shared-ui/component/Toast";

const validateUsername = (value: string): string => {
    const normalized = value.trim();
    if (!normalized) {
        return "Username pengawas wajib diisi";
    }
    if (normalized.length < 3) {
        return "Username minimal 3 karakter";
    }
    return "";
};

const validatePassword = (value: string): string => {
    if (!value) {
        return "Kata sandi wajib diisi";
    }
    if (value.length < 6) {
        return "Kata sandi minimal 6 karakter";
    }
    return "";
};

export default function LoginFormSection() {
    const { login, loading } = useAuthApi();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const usernameError = submitted ? validateUsername(username) : "";
    const passwordError = submitted ? validatePassword(password) : "";
    const isFormValid = !validateUsername(username) && !validatePassword(password);

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        setSubmitted(true);

        if (!isFormValid) {
            showErrorToast("Silakan periksa kembali kredensial pengawas Anda.");
            return;
        }

        const success = await login({
            username: username.trim(),
            password,
        });

        if (success) {
            showSuccessToast("Login berhasil! Mengalihkan ke ruang pemantauan...");
            // Hard redirect agar cookie 'proctor_access_token' terbaca oleh src/proxy.ts
            window.location.replace("/monitoring");
        }
    };

    return (
        <main className="grid h-dvh min-h-0 w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-[52%_48%]">
            {/* LEFT HERO SECTION (Exam Proctoring Theme) */}
            <section className="relative hidden h-dvh min-h-0 min-w-0 overflow-hidden bg-slate-900 lg:grid lg:grid-rows-[auto_auto_minmax(0,1fr)]">
                <div
                    aria-hidden="true"
                    className="absolute top-0 right-0 h-96 w-96 rounded-bl-full bg-emerald-500/10 blur-2xl"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-20 -left-20 h-96 w-96 rounded-tr-full bg-blue-500/10 blur-2xl"
                />

                <div className="relative z-20 px-12 pt-8">
                    <BrandLogo />
                </div>

                <div className="relative z-20 mt-8 ml-12 max-w-xl pr-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                        <ShieldCheck className="size-4" />
                        <span>Sistem Pengawasan Ujian Terpadu</span>
                    </div>

                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
                        Integritas Ujian Digital Terjamin &amp; Terpercaya
                    </h1>

                    <p className="mt-4 text-base leading-relaxed text-slate-300">
                        Monitoring pengerjaan kuis real-time, audit bukti kecurangan SHA-256 anti-tamper, dan kontrol ruang ujian Moodle terpusat.
                    </p>
                </div>

                <div className="relative z-10 mt-6 min-h-0 min-w-0 px-12 pb-8">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50 shadow-2xl">
                        <Image
                            alt="Dashboard Pemantauan Ujian"
                            className="object-cover object-top opacity-80"
                            fill
                            priority
                            sizes="(min-width: 1024px) 50vw, 0px"
                            src="/assets/images/illustrations/exam-guard-hero.png"
                        />
                    </div>
                </div>
            </section>

            {/* RIGHT FORM SECTION */}
            <section className="relative flex h-dvh min-h-0 min-w-0 flex-col justify-center overflow-y-auto bg-white px-6 py-8 sm:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-md">
                    <div className="text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                            Masuk Portal Pengawas
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Gunakan akun pengawas ruangan atau ketua pengawas yang terdaftar.
                        </p>
                    </div>

                    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                        <AuthTextField
                            data-testid="input-username"
                            error={usernameError}
                            label="Username Pengawas"
                            leftIcon={User}
                            onBlurAction={() => setSubmitted(true)}
                            onChangeAction={setUsername}
                            placeholder="Masukkan username Anda"
                            required
                            touched={submitted}
                            value={username}
                        />

                        <AuthTextField
                            data-testid="input-password"
                            error={passwordError}
                            label="Kata Sandi"
                            leftIcon={Lock}
                            onBlurAction={() => setSubmitted(true)}
                            onChangeAction={setPassword}
                            onRightIconClickAction={() => setShowPassword((prev) => !prev)}
                            placeholder="Masukkan kata sandi"
                            required
                            rightIcon={showPassword ? EyeOff : Eye}
                            touched={submitted}
                            type={showPassword ? "text" : "password"}
                            value={password}
                        />

                        <Button
                            className="mt-2 h-12 rounded-xl text-base font-semibold shadow-md"
                            color="success"
                            data-testid="btn-submit"
                            disabled={loading}
                            fullWidth
                            loading={loading}
                            size="lg"
                            type="submit"
                            variant="filled"
                        >
                            Masuk ke Dashboard
                        </Button>
                    </form>

                    <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
                        Sistem Terintegrasi Moodle QuizAccess Guard &copy; 2026
                    </div>
                </div>
            </section>
        </main>
    );
}