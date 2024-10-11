/*
  Warnings:

  - You are about to drop the column `scored` on the `teamsBoosts` table. All the data in the column will be lost.
  - You are about to drop the column `scored` on the `teamsCards` table. All the data in the column will be lost.
  - You are about to drop the column `scored` on the `teamsGoals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "points" INTEGER;

-- AlterTable
ALTER TABLE "teamsBoosts" DROP COLUMN "scored",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "teamsCards" DROP COLUMN "scored",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "teamsGoals" DROP COLUMN "scored",
ADD COLUMN     "points" INTEGER;
