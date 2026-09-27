# Exam Guard - Project Planning & Documentation

## 1. Pendahuluan
Exam Guard adalah aplikasi *proctoring* dan pemantauan ujian berbasis web yang terintegrasi dengan Moodle LMS via RPC. Aplikasi ini dirancang untuk memastikan integritas ujian dengan memfasilitasi pengawas (proctor) dalam memantau, mengelola, dan menindaklanjuti status peserta ujian di ruangan masing-masing secara efisien.

## 2. Arsitektur Modul (Struktur Aplikasi)
Proyek ini mengadopsi pendekatan modular dengan *Clean Architecture* (*Domain-Driven Design*). Direktori kode di dalam `src/modules/` dibagi menjadi modul-modul berikut:
- **Auth**: Menangani autentikasi, otorisasi, dan manajemen sesi pengguna.
- **Proctor Management**: Manajemen data pengawas ujian, alokasi tugas, dan hak akses.
- **Exam Session**: Pengelolaan sinkronisasi sesi ujian dari kuis aktif di Moodle.
- **Exam Monitoring**: Layar utama pemantauan *real-time* siswa (status, waktu pengerjaan, lock/unlock).
- **Violations**: Sistem pencatatan dan rekapitulasi pelanggaran/kecurangan siswa.
- **Proctor Chat**: Sistem komunikasi internal untuk pengawas dan log notifikasi.

## 3. Roadmaps & Manajemen Isu (Issues)
Untuk memudahkan pelacakan tugas (*task tracking*), pengembangan dipecah menjadi beberapa isu spesifik. Setiap isu dikelola di dalam file terpisah agar mudah didelegasikan dan dikerjakan.

Daftar isu dapat dilihat pada folder `docs/issues/`:
- [Issue #1: Modul Autentikasi & Otorisasi (Auth)](./issues/issue-1-auth.md)
- [Issue #2: Manajemen Pengawas (Proctor Management)](./issues/issue-2-proctor-management.md)
- [Issue #3: Manajemen Sesi Ujian (Exam Session)](./issues/issue-3-exam-session.md)
- [Issue #4: Pemantauan Ujian Real-time (Exam Monitoring)](./issues/issue-4-exam-monitoring.md)
- [Issue #5: Sistem Pencatatan Pelanggaran (Violations)](./issues/issue-5-violations.md)
- [Issue #6: Sistem Obrolan & Notifikasi (Proctor Chat)](./issues/issue-6-proctor-chat.md)

## 4. Panduan Pengembangan (Development Guidelines)
- **Teknologi Utama**: Next.js 16 (App Router), React 19, Prisma ORM, PostgreSQL, TailwindCSS v4.
- **Standar Kode**: Menggunakan `biome` untuk keperluan *linting* dan *formatting*. Jalankan `npm run lint` dan `npm run format` secara berkala.
- **Alur Kerja (Workflow)**: Setiap pengerjaan fitur wajib merujuk pada file *issue* terkait, dan disarankan menggunakan strategi *feature branching* (misalnya `feature/auth-module`, `fix/monitoring-sync`).
