/*
  Warnings:

  - You are about to drop the column `dob` on the `Patient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dni]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfBirth` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- 1. Agregar las columnas como NULLABLE primero
ALTER TABLE "Patient" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN "dni" TEXT;

-- 2. Asignar valores temporales a los registros existentes
UPDATE "Patient" SET "dateOfBirth" = '2000-01-01', "dni" = 'TEMP_DNI' WHERE "dateOfBirth" IS NULL OR "dni" IS NULL;

-- 3. Alterar las columnas para que sean NOT NULL
ALTER TABLE "Patient" ALTER COLUMN "dateOfBirth" SET NOT NULL;
ALTER TABLE "Patient" ALTER COLUMN "dni" SET NOT NULL;

-- 4. Eliminar la columna antigua 'dob'
ALTER TABLE "Patient" DROP COLUMN "dob";

-- 5. Crear el índice único
CREATE UNIQUE INDEX "Patient_dni_key" ON "Patient"("dni");
