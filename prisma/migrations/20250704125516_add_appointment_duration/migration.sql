-- CreateEnum
CREATE TYPE "AppointmentDuration" AS ENUM ('SHORT', 'LONG');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "duration" "AppointmentDuration" NOT NULL DEFAULT 'SHORT';
