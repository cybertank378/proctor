# Issue #3: Manajemen Sesi Ujian (Exam Session)

## Deskripsi Fitur
Modul ini menangani sinkronisasi data kuis atau ujian dari Moodle. Aplikasi bertugas menyajikan daftar sesi kuis mana saja yang sedang berjalan (aktif) hari ini, sehingga pengawas dapat memilih sesi yang harus dipantau.

## Acceptance Criteria
- [x] Aplikasi berhasil terhubung dan menarik data kuis aktif dari sistem Moodle (melalui fungsi RPC `quizaccess_guard_get_active_quizzes`).
- [x] Menampilkan antarmuka yang berisi daftar sesi ujian aktif yang valid bagi pengguna (berdasarkan hak akses dan tanggal rilis).
- [x] Menyediakan informasi jam buka (*time open*) dan jam tutup (*time close*) ujian.

## Task Checklist
- [x] Integrasikan `MoodleGuardRpcClient` untuk mengambil data `getActiveQuizzes()`.
- [x] Buat *Use Case* (misal `GetActiveExamSessionsUseCase`) di *layer application* untuk memformat data yang diterima dari Moodle.
- [x] Bangun komponen UI (bentuk kartu atau daftar/list) yang menampilkan ujian apa saja yang bisa dipilih pengawas.
- [x] Integrasikan logika untuk meneruskan pilihan sesi ujian aktif ke modul Pemantauan (*Exam Monitoring*).
