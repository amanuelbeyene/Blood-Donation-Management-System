-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "gender" TEXT,
    "medicalCondition" TEXT,
    "profilePicture" TEXT,
    "region" TEXT,
    "city" TEXT,
    "subCity" TEXT,
    "woreda" TEXT,
    "kebele" TEXT,
    "street" TEXT,
    "homeNumber" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fanNumber" TEXT,
    "hasDisability" TEXT,
    "disabilityType" TEXT,
    "donationAppointmentDate" TIMESTAMP(3),
    "appointmentRegion" TEXT,
    "appointmentPlace" TEXT,
    "appointmentTime" TEXT,
    "lotteryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "rejectionReason" TEXT,
    "lastDonation" TIMESTAMP(3),
    "availability" TEXT DEFAULT 'ready',
    "totalDonations" INTEGER NOT NULL DEFAULT 0,
    "impactScore" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT,
    "password" TEXT,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contactDoctorName" TEXT,
    "contactDoctorPhone" TEXT,
    "region" TEXT,
    "city" TEXT,
    "subCity" TEXT,
    "woreda" TEXT,
    "kebele" TEXT,
    "street" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "licenseName" TEXT,
    "licenseNumber" TEXT,
    "hospitalType" TEXT,
    "username" TEXT,
    "password" TEXT,
    "profilePicture" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "rejectionReason" TEXT,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "patient" TEXT,
    "bloodType" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "unitsNeeded" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "donationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "unitsAvailable" INTEGER NOT NULL,
    "criticalThreshold" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_fanNumber_key" ON "Donor"("fanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_username_key" ON "Donor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_email_key" ON "Hospital"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_username_key" ON "Hospital"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
