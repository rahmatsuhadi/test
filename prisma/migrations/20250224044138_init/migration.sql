/*
  Warnings:

  - Added the required column `projectName` to the `Database` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Database" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "projectName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Database" ("_id", "createdAt", "name", "type", "uri") SELECT "_id", "createdAt", "name", "type", "uri" FROM "Database";
DROP TABLE "Database";
ALTER TABLE "new_Database" RENAME TO "Database";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
