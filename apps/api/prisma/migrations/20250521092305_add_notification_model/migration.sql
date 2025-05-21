-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERAL', 'POLL_NEW', 'POLL_VOTE_RECEIVED', 'PAYMENT_REQUEST_NEW', 'PAYMENT_REQUEST_DUE', 'PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" DEFAULT 'GENERAL',
    "relatedEntityType" TEXT,
    "relatedEntityId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
