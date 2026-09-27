# Issue #2: Manajemen Pengawas (Proctor Management)

## Deskripsi Fitur
Modul administratif ini digunakan untuk mengelola data para pengawas (proctor). Administrator memiliki hak akses untuk menambah pengawas baru, mengubah profil, serta menugaskan pengawas ke ruangan (room) tertentu saat ujian.

## Acceptance Criteria
- [x] Admin memiliki akses ke halaman daftar pengawas.
- [x] Admin dapat melakukan operasi CRUD (Create, Read, Update, Disable) pada akun pengawas.
- [x] Pengawas dapat ditugaskan secara spesifik ke satu atau beberapa entitas ruangan (*Room Number*).
- [x] Data pengawas disajikan dengan dukungan pencarian (berdasarkan nama) dan sistem paginasi.

## Task Checklist
- [x] Susun *Server Actions* atau API Route untuk melayani operasi CRUD entitas Proctor.
- [x] Kembangkan *Repository* dan *Use Case* pada modul `proctor-management`.
- [x] Buat UI *Dashboard* Manajemen Pengawas dalam bentuk tabel menggunakan komponen dari `shared-ui`.
- [x] Sediakan *Modal Dialog* atau halaman form terpisah untuk proses pembuatan akun pengawas baru beserta penugasan ruangan.
