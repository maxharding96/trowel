/*
  Warnings:

  - Added the required column `releaseId` to the `Want` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Want" ADD COLUMN     "releaseId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Want" ADD CONSTRAINT "Want_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "public"."Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
