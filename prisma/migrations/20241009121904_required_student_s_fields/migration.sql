/*
  Warnings:

  - Made the column `name` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rm` on table `students` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "students" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "rm" SET NOT NULL;
