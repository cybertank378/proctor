# Issue #6: Sistem Obrolan & Notifikasi (Proctor Chat)

## Deskripsi Fitur
Modul ini menaungi infrastruktur komunikasi dan interaksi ringan (berbasis pesan) antar pengawas dalam sistem. Selain itu, fasilitas notifikasi peringatan diintegrasikan agar pemberitahuan krusial tidak terlewat oleh pengawas.

## Acceptance Criteria
- [ ] Aplikasi mendukung fungsionalitas kirim pesan tekstual (obrolan/chat) antar pengawas secara asinkron atau sinkron.
- [ ] Jika ada pembaruan krusial dari server atau pesan darurat, akan muncul *toast* notifikasi di layar antarmuka pengguna secara mencolok.
- [ ] Jendela atau tab obrolan mudah diakses (sebagai fitur tambahan yang selalu *floating* atau bersandar pada menu navigasi).

## Task Checklist
- [ ] Tetapkan pola/mekanisme pembaruan *real-time* (bisa menggunakan *database polling*, SSE, atau *WebSockets/Pusher* jika ada).
- [ ] Rancang UI antarmuka jendela obrolan (*Chat Box*).
- [ ] Implementasikan pemberitahuan/notifikasi sistem (*system alerts*) menggunakan paket dependensi seperti `react-toastify`.
- [ ] Uji fungsionalitas notifikasi saat ada perubahan status kunci siswa dari server.
