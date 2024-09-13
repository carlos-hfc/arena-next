/*
  Warnings:

  - You are about to drop the column `launchedAt` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "panels" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "launchedAt",
ADD COLUMN     "releasedAt" TIMESTAMP(3);
