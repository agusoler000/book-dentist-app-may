-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushAppointments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushEmergencies" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushStatusChanges" BOOLEAN NOT NULL DEFAULT true;
