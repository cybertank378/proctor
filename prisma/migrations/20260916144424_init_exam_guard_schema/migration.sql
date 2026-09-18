-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'LOCKED', 'DISQUALIFIED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ViolationType" AS ENUM ('TAB_SWITCH', 'WINDOW_BLUR', 'DEVTOOLS_OPEN', 'RESTRICTED_KEY', 'MULTI_MONITOR');

-- CreateEnum
CREATE TYPE "ProctorRole" AS ENUM ('CHIEF_PROCTOR', 'PROCTOR');

-- CreateTable
CREATE TABLE "exam_attempt_records" (
    "id" TEXT NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "maxAllowedViolations" INTEGER NOT NULL DEFAULT 3,
    "disqualificationReason" VARCHAR(255),
    "isLockedByProctor" BOOLEAN NOT NULL DEFAULT false,
    "unlockedByProctorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempt_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violation_records" (
    "id" TEXT NOT NULL,
    "attemptRecordId" TEXT NOT NULL,
    "type" "ViolationType" NOT NULL,
    "localFilePath" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "sha256Hash" VARCHAR(64) NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proctor_chat_message_records" (
    "id" TEXT NOT NULL,
    "quizId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "senderName" VARCHAR(100) NOT NULL,
    "role" "ProctorRole" NOT NULL DEFAULT 'PROCTOR',
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proctor_chat_message_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_records_attemptId_key" ON "exam_attempt_records"("attemptId");

-- CreateIndex
CREATE INDEX "exam_attempt_records_quizId_userId_idx" ON "exam_attempt_records"("quizId", "userId");

-- CreateIndex
CREATE INDEX "exam_attempt_records_status_idx" ON "exam_attempt_records"("status");

-- CreateIndex
CREATE INDEX "violation_records_attemptRecordId_idx" ON "violation_records"("attemptRecordId");

-- CreateIndex
CREATE INDEX "violation_records_type_idx" ON "violation_records"("type");

-- CreateIndex
CREATE INDEX "proctor_chat_message_records_quizId_createdAt_idx" ON "proctor_chat_message_records"("quizId", "createdAt");

-- AddForeignKey
ALTER TABLE "violation_records" ADD CONSTRAINT "violation_records_attemptRecordId_fkey" FOREIGN KEY ("attemptRecordId") REFERENCES "exam_attempt_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
