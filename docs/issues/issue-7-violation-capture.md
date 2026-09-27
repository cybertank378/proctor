# Issue #7: Pengambilan Bukti Pelanggaran (Evidence Capture)

## Deskripsi Fitur
Sebagai kelanjutan dari sistem pencatatan pelanggaran, sistem harus secara otomatis (atau manual) menangkap bukti kecurangan (seperti *screenshot* layar ujian siswa, tangkapan webcam, atau aktivitas browser) saat siswa terindikasi melakukan pelanggaran. Bukti tersebut kemudian akan disimpan di direktori lokal (`public/assets/evidences`) dan datanya diikat ke *database* pada tabel pelanggaran (*Violation*).

## Acceptance Criteria
- [x] Tersedia mekanisme di sisi *client* (siswa) untuk menangkap aktivitas mencurigakan (contoh: *screenshot* dari DOM menggunakan `html2canvas`, rekam webcam, atau *event* berpindah tab).
- [x] Bukti pelanggaran yang ditangkap diunggah secara aman ke server.
- [x] Server (melalui API/Use Case) menyimpan *file* gambar/bukti ke dalam folder statis `public/assets/evidences/`.
- [x] *Path* atau URL bukti pelanggaran tersebut disimpan dengan benar pada *database* (tabel `ViolationEvidence` atau sejenisnya) dan direlasikan dengan sesi ujian siswa.
- [x] Pengawas dapat melihat bukti gambar (*evidence*) tersebut pada halaman Audit Bukti atau saat melakukan pratinjau pelanggaran di Dashboard Pengawas.

## Task Checklist
- [x] Rancang API Route (misal `POST /api/violations/capture`) untuk menerima unggahan *file* bukti (gambar base64 atau *form-data*).
- [x] Buat *Use Case* di backend untuk menyimpan *file* fisik ke direktori `public/assets/evidences/` dan menyimpan rekam jejak (*path*, *timestamp*) ke dalam *database* (Prisma).
- [x] Kembangkan hook atau utilitas di sisi *frontend* siswa yang akan otomatis mengeksekusi pengambilan gambar saat ada *event* kecurangan (misal ketika *visibilitychange* terdeteksi atau melalui intervensi proctor).
- [x] Perbarui antarmuka `ViolationEvidenceModal` di Dashboard Pengawas agar dapat memuat dan menampilkan gambar dari folder `public/assets/evidences/`.
