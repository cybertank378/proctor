// Files: prisma/seed.ts
import * as argon2 from "argon2";
// Gabungkan impor PrismaClient dan ProctorRole langsung dari root generated folder
import { ProctorRole } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";

async function main() {
  console.log("🌱 Menjalankan Seeder ProctorUser...");

  const defaultPassword = "Password123!";
  const passwordHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
  });

  const proctorUsers = [
    {
      username: "superadmin",
      fullName: "Koordinator Pengawas Utama",
      role: ProctorRole.CHIEF_PROCTOR,
      roomNumber: null,
      moodleUserId: 2,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas1",
      fullName: "Agus Wurjantoro",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4917,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas2",
      fullName: "Arip Wicaksono",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4918,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas3",
      fullName: "Dani Haryanto",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4919,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas4",
      fullName: "DWI LESTARI",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4920,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas5",
      fullName: "Edy Kusnowidodo",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4921,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas6",
      fullName: "Fitriani",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4922,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas7",
      fullName: "Giri Handoko",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4923,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas8",
      fullName: "Guntur Siagian",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4924,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas9",
      fullName: "Heni Purwaningsih",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4925,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas10",
      fullName: "Ibnu Kausar",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4926,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas11",
      fullName: "Ibrahim Abubakar",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4927,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas12",
      fullName: "Ika Pratiwi",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4928,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas13",
      fullName: "Irawaty",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4929,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas14",
      fullName: "ISMAHADI",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4930,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas15",
      fullName: "Lutfi Riesqi Prasetyo",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4931,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas16",
      fullName: "MAIMUN",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4932,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas17",
      fullName: "Muhammad Fahd Indrawan",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4933,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas18",
      fullName: "Muhammad Nur Fiqri",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4934,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas19",
      fullName: "Muwaliha Aufa",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4935,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas20",
      fullName: "Rexy Mahindra",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4936,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas21",
      fullName: "Riza Chafiz",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4937,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas22",
      fullName: "Ryta Melyana",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4938,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas23",
      fullName: "Sadirin",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4939,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas24",
      fullName: "Tri Hardianto",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4941,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas25",
      fullName: "Wahyu Lestari",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4942,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas26",
      fullName: "Wenni Ayuningtyas",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4943,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas27",
      fullName: "Akhmad Zulfikar",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4944,
      isActive: true,
      passwordHash,
    },
    {
      username: "pengawas28",
      fullName: "Choirul Imam Wahid",
      role: ProctorRole.PROCTOR,
      roomNumber: "Lab Komputer 1",
      moodleUserId: 4945,
      isActive: true,
      passwordHash,
    },
  ];

  for (const user of proctorUsers) {
    const record = await prisma.proctorUser.upsert({
      where: { username: user.username },
      update: {
        fullName: user.fullName,
        role: user.role,
        roomNumber: user.roomNumber,
        moodleUserId: user.moodleUserId,
        isActive: user.isActive,
        passwordHash: user.passwordHash,
      },
      create: user,
    });

    console.log(`✔ User disiapkan: ${record.username} (${record.role})`);
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan seeder:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
