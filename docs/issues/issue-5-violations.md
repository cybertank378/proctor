# Issue #5: Sistem Pencatatan Pelanggaran (Violations)

## Deskripsi Fitur
Modul pelengkap yang memfasilitasi pencatatan manual atas pelanggaran atau kecurangan yang dilakukan oleh siswa saat pengerjaan kuis. Modul ini menjadi tempat penyimpanan log (bukti rekam) kegiatan ilegal, berpotensi mengandalkan pengawasan visual (webcam).

## Acceptance Criteria
- [x] Pengawas memiliki tombol aksi untuk melaporkan pelanggaran (*report violation*) secara instan pada daftar peserta di halaman monitoring.
- [x] Sistem menyimpan log historis dari pelanggaran yang tercatat di database lokal Prisma.
- [x] Apabila sistem dirancang menggunakan input visual (sesuai dependensi `react-webcam`), aplikasi mendukung penangkapan (*capture*) atau unggah (*upload*) bukti foto kecurangan.
- [x] Admin memiliki akses rekapitulasi jumlah atau frekuensi pelanggaran siswa.

## Task Checklist
- [x] Rancang dan terapkan skema model Prisma untuk tabel `Violation` beserta relasinya ke *Exam/Attempt* dan *Proctor*.
- [x] Buat form atau modal pelaporan pelanggaran cepat.
- [x] Kembangkan *Use Case* untuk pencatatan log pelanggaran.
- [x] (Opsional/Tergantung kebutuhan) Integrasikan elemen `react-webcam` pada layar *client* apabila diperlukan *evidence capture* mandiri.
