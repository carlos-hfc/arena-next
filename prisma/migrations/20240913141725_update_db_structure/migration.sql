/*
  Warnings:

  - You are about to drop the column `time` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `panels` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `teamsBoosts` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `teamsCards` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `teamsGoals` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `teamsGoals` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sendedById` to the `teamsGoals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_createdById_fkey";

-- DropForeignKey
ALTER TABLE "teamsGoals" DROP CONSTRAINT "teamsGoals_studentId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_teamId_fkey";

-- AlterTable
ALTER TABLE "logs" DROP COLUMN "time",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "panels" DROP COLUMN "time";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "teamsBoosts" DROP COLUMN "points",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "teamsCards" DROP COLUMN "points",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "teamsGoals" DROP COLUMN "points",
DROP COLUMN "studentId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sendedById" TEXT NOT NULL;

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "rm" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studentTeams" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "studentTeams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_rm_key" ON "students"("rm");

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentTeams" ADD CONSTRAINT "studentTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentTeams" ADD CONSTRAINT "studentTeams_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamsGoals" ADD CONSTRAINT "teamsGoals_sendedById_fkey" FOREIGN KEY ("sendedById") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
