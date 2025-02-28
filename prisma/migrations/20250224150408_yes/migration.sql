/*
  Warnings:

  - You are about to drop the column `isNull` on the `Field` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Field" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isRequird" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Field_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Field" ("_id", "createdAt", "isPrimary", "name", "table_id", "type") SELECT "_id", "createdAt", "isPrimary", "name", "table_id", "type" FROM "Field";
DROP TABLE "Field";
ALTER TABLE "new_Field" RENAME TO "Field";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
