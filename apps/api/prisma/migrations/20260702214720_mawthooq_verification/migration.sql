-- CreateEnum
CREATE TYPE "MawthooqStatus" AS ENUM ('none', 'pending', 'verified', 'rejected', 'expired');

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "mawthooqExpiresAt" TIMESTAMP(3),
ADD COLUMN     "mawthooqLicenseNo" TEXT,
ADD COLUMN     "mawthooqReviewNote" TEXT,
ADD COLUMN     "mawthooqStatus" "MawthooqStatus" NOT NULL DEFAULT 'none',
ADD COLUMN     "mawthooqSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "mawthooqVerifiedAt" TIMESTAMP(3);
