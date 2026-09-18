-- AlterTable
ALTER TABLE "exam_attempt_records" ADD COLUMN     "roomNumber" VARCHAR(50),
ALTER COLUMN "unlockedByProctorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "proctor_chat_message_records" ADD COLUMN     "roomNumber" VARCHAR(50),
ALTER COLUMN "senderId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "proctor_users" (
    "id" TEXT NOT NULL,
    "moodleUserId" INTEGER,
    "username" VARCHAR(50) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "role" "ProctorRole" NOT NULL DEFAULT 'PROCTOR',
    "roomNumber" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proctor_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proctor_sessions" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(128) NOT NULL,
    "proctorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proctor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proctor_users_moodleUserId_key" ON "proctor_users"("moodleUserId");

-- CreateIndex
CREATE UNIQUE INDEX "proctor_users_username_key" ON "proctor_users"("username");

-- CreateIndex
CREATE INDEX "proctor_users_roomNumber_idx" ON "proctor_users"("roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "proctor_sessions_token_key" ON "proctor_sessions"("token");

-- CreateIndex
CREATE INDEX "proctor_sessions_token_idx" ON "proctor_sessions"("token");

-- CreateIndex
CREATE INDEX "proctor_sessions_proctorId_idx" ON "proctor_sessions"("proctorId");

-- CreateIndex
CREATE INDEX "exam_attempt_records_roomNumber_idx" ON "exam_attempt_records"("roomNumber");

-- CreateIndex
CREATE INDEX "proctor_chat_message_records_roomNumber_idx" ON "proctor_chat_message_records"("roomNumber");

-- AddForeignKey
ALTER TABLE "proctor_sessions" ADD CONSTRAINT "proctor_sessions_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "proctor_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_records" ADD CONSTRAINT "exam_attempt_records_unlockedByProctorId_fkey" FOREIGN KEY ("unlockedByProctorId") REFERENCES "proctor_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proctor_chat_message_records" ADD CONSTRAINT "proctor_chat_message_records_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "proctor_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
