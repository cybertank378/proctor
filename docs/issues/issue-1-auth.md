# Issue #1: Modul Autentikasi & Otorisasi (Auth)

## Deskripsi Fitur
Sebagai sistem *proctoring*, aplikasi membutuhkan sistem autentikasi yang aman untuk membedakan antara SuperAdmin, Admin, dan Proctor. Modul ini bertanggung jawab untuk proses login, manajemen sesi (menggunakan JWT/cookies), serta proteksi halaman rute (*route guarding*).

## Acceptance Criteria (Kriteria Penerimaan)
- [x] Pengguna dapat masuk (login) ke sistem menggunakan kombinasi email/username dan password.
- [x] Sistem memvalidasi dan memverifikasi *password* menggunakan enkripsi modern (Argon2).
- [x] Sesi pengguna (*session*) dikelola dengan aman menggunakan standard JWT (pustaka `jose`).
- [x] Halaman dashboard dan modul lain tidak dapat diakses (di- *redirect*) tanpa sesi login yang valid.
- [x] Terdapat mekanisme *Role-Based Access Control* (RBAC) untuk membedakan peran (misalnya admin tidak sama dengan proctor).

## Task Checklist
- [x] Buat skema database Prisma untuk tabel `User` / `Proctor`.
- [x] Implementasikan lapisan *Domain* dan *Use Case* untuk proses login dan verifikasi kredensial.
- [x] Bangun antarmuka halaman login yang responsif dengan TailwindCSS.
- [x] Implementasikan *proxy.ts* (pengganti middleware) di tingkat `src` untuk memproteksi *routes*.
