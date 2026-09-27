# Issue #4: Pemantauan Ujian Real-time (Exam Monitoring)

## Deskripsi Fitur
Ini adalah fitur fundamental dari *Exam Guard*. Fitur ini menyediakan *dashboard* interaktif bagi pengawas untuk melihat peserta mana saja yang sedang melakukan upaya (*attempts*) kuis. Fitur penting dari modul ini adalah pemantauan status dan operasi pembukaan akses ujian peserta yang terkunci.

## Acceptance Criteria
- [x] Pengawas disajikan tabel yang memuat daftar peserta (Nama, Kelas, Ruangan, Status, Jam Mulai).
- [x] Daftar tersinkronisasi otomatis dari Moodle menggunakan RPC `quizaccess_guard_get_active_attempts`.
- [x] Pengawas hanya melihat siswa yang difilter secara spesifik sesuai *Room Number* atau otoritas pengawas tersebut.
- [x] Indikator visual jelas membedakan antara peserta yang sedang mengerjakan, selesai, atau terkunci (*islocked*).
- [x] Jika peserta berstatus terkunci, tombol aksi *Unlock* muncul dan memicu fungsi RPC Moodle `quizaccess_guard_unlock_student`.

## Task Checklist
- [x] Selesaikan integrasi kode pada file `GetActiveAttemptsUseCase.ts`.
- [x] Implementasikan tampilan tabel pemantauan (*monitoring table*), pastikan ada mekanisme otomatis mengambil ulang (*polling* atau auto-refresh) data siswa.
- [x] Buat komponen fungsi *Unlock Button* yang mengait dengan *Server Action* terkait RPC Moodle.
- [x] Tambahkan fungsionalitas pencarian nama siswa serta filter berdasarkan status.
