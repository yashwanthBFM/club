-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'STATUS_CHANGE';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PARENT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "metadata" JSONB;
