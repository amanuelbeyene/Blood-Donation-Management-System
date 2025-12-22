-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "city" TEXT,
ADD COLUMN     "homeNumber" TEXT,
ADD COLUMN     "kebele" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "street" TEXT,
ADD COLUMN     "subCity" TEXT,
ADD COLUMN     "woreda" TEXT;
