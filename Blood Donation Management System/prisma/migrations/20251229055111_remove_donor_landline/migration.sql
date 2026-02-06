/*
  Warnings:

  - Added the required column `landline` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landline` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landline` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "fanNumber" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "landline" TEXT NOT NULL,
ADD COLUMN     "maritalStatus" TEXT;

-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "weight" INTEGER;

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "landline" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "landline" TEXT NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AdminActivityLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
