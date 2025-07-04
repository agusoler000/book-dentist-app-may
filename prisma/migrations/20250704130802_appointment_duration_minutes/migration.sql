/*
  Warnings:

  - You are about to drop the column `duration` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `durationMinutes` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "duration",
ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 30;

-- DropEnum
DROP TYPE "AppointmentDuration";
