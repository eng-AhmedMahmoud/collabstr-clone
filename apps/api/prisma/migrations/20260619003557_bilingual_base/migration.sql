/*
  Warnings:

  - The `body` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `title` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL,
DROP COLUMN "body",
ADD COLUMN     "body" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" TEXT;
