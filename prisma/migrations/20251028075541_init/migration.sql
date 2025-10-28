/*
  Warnings:

  - You are about to drop the `ElectronicComponent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ElectronicComponent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "electronicComponent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mpn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "packaging" TEXT,
    "datasheet" TEXT,
    "place" TEXT NOT NULL
);
