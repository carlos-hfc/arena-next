/*
  Warnings:

  - You are about to drop the column `title` on the `teamsGoals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teamsBoosts" ADD COLUMN     "scored" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teamsCards" ADD COLUMN     "scored" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teamsGoals" DROP COLUMN "title",
ADD COLUMN     "scored" BOOLEAN NOT NULL DEFAULT false;
