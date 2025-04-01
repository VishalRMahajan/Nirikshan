-- CreateTable
CREATE TABLE "TrafficAidPost" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "hasPoliceService" BOOLEAN NOT NULL DEFAULT false,
    "hasAmbulance" BOOLEAN NOT NULL DEFAULT false,
    "hasFireService" BOOLEAN NOT NULL DEFAULT false,
    "operatingHours" TEXT NOT NULL DEFAULT '24/7',
    "additionalInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrafficAidPost_pkey" PRIMARY KEY ("id")
);
