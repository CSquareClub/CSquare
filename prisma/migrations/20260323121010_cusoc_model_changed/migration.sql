/*
  Warnings:

  - You are about to drop the column `primaryGoal` on the `CusocRegistration2026` table. All the data in the column will be lost.
  - You are about to drop the column `primaryTrack` on the `CusocRegistration2026` table. All the data in the column will be lost.
  - You are about to drop the column `proposalOrgName` on the `CusocRegistration2026` table. All the data in the column will be lost.
  - You are about to drop the column `proposalProblemStatement` on the `CusocRegistration2026` table. All the data in the column will be lost.
  - You are about to drop the column `proposalProjectTitle` on the `CusocRegistration2026` table. All the data in the column will be lost.
  - You are about to drop the column `proposalSolution` on the `CusocRegistration2026` table. All the data in the column will be lost.
  - You are about to drop the column `proposalTechStack` on the `CusocRegistration2026` table. All the data in the column will be lost.
  - You are about to drop the column `proposalTimeline` on the `CusocRegistration2026` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CusocRegistration2026" DROP COLUMN "primaryGoal",
DROP COLUMN "primaryTrack",
DROP COLUMN "proposalOrgName",
DROP COLUMN "proposalProblemStatement",
DROP COLUMN "proposalProjectTitle",
DROP COLUMN "proposalSolution",
DROP COLUMN "proposalTechStack",
DROP COLUMN "proposalTimeline",
ADD COLUMN     "domainOrder" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "goals" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "personalEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "proposalFileUrl" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CusocRegistration2027" ADD COLUMN     "personalEmail" TEXT NOT NULL DEFAULT '';
