/*
  Warnings:

  - You are about to drop the column `isTrialActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndsAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTrialActive",
DROP COLUMN "trialEndsAt",
ALTER COLUMN "subscriptionStatus" SET DEFAULT 'inactive';
