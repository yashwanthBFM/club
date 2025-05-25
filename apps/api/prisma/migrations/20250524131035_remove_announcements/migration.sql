/*
  Warnings:

  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'GAME_REGISTRATION';
ALTER TYPE "NotificationType" ADD VALUE 'GAME_STATUS_CHANGE';

-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_createdById_fkey";

-- DropTable
DROP TABLE "Announcement";
