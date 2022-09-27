/*
  Warnings:

  - Added the required column `type` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city" TEXT NOT NULL,
    "name" TEXT,
    "available" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "decription" TEXT
);
INSERT INTO "new_Property" ("available", "city", "decription", "id", "name", "price") SELECT "available", "city", "decription", "id", "name", "price" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
