/*
  Warnings:

  - The values [GUEST] on the enum `AuthType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthType_new" AS ENUM ('CREDENTIALS', 'GOOGLE', 'FACEBOOK');
ALTER TABLE "public"."User" ALTER COLUMN "authType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "authType" TYPE "AuthType_new" USING ("authType"::text::"AuthType_new");
ALTER TYPE "AuthType" RENAME TO "AuthType_old";
ALTER TYPE "AuthType_new" RENAME TO "AuthType";
DROP TYPE "public"."AuthType_old";
ALTER TABLE "User" ALTER COLUMN "authType" SET DEFAULT 'CREDENTIALS';
COMMIT;

-- CreateTable
CREATE TABLE "MassageBooking" (
    "id" TEXT NOT NULL,
    "massageId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MassageBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MassageBooking" ADD CONSTRAINT "MassageBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
