/*
  Warnings:

  - Added the required column `path` to the `teamsGoals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `teamsGoals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teamsGoals" ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
