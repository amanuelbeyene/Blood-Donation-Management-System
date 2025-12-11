-- Migration: Add profile pictures and detailed location fields
-- This migration adds all new fields for Donor and Hospital models

-- ============================================
-- DONOR TABLE UPDATES
-- ============================================

-- Add new phone column (String) if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Donor' AND column_name='phone') THEN
    ALTER TABLE "Donor" ADD COLUMN "phone" TEXT;
    
    -- Migrate data from PhoneNumber (Int) to phone (String) if PhoneNumber exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Donor' AND column_name='PhoneNumber') THEN
      UPDATE "Donor" SET "phone" = CAST("PhoneNumber" AS TEXT) WHERE "PhoneNumber" IS NOT NULL;
      ALTER TABLE "Donor" DROP COLUMN "PhoneNumber";
    END IF;
  END IF;
END $$;

-- Add email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Donor' AND column_name='email') THEN
    ALTER TABLE "Donor" ADD COLUMN "email" TEXT;
  END IF;
END $$;

-- Add age column
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "age" INTEGER;

-- Add detailed location fields
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "subCity" TEXT;
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "woreda" TEXT;
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "kebele" TEXT;
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "street" TEXT;
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "homeNumber" TEXT;

-- Add geolocation fields
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Add profile picture
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;

-- Add medical condition
ALTER TABLE "Donor" ADD COLUMN IF NOT EXISTS "medicalCondition" TEXT;

-- ============================================
-- HOSPITAL TABLE UPDATES
-- ============================================

-- Add phone column
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Add email column
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- Add contact person
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "contactPerson" TEXT;

-- Add detailed location fields
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "subCity" TEXT;
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "woreda" TEXT;
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "kebele" TEXT;
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "street" TEXT;

-- Add geolocation fields
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Add business license fields
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "businessLicenseName" TEXT;
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "businessLicenseNumber" TEXT;

-- Add hospital type
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "hospitalType" TEXT;

-- Add profile picture
ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;

