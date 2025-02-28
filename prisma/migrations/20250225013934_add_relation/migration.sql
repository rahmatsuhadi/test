/*
  Warnings:

  - You are about to drop the column `field_a_id` on the `Relation` table. All the data in the column will be lost.
  - You are about to drop the column `field_b_id` on the `Relation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Relation" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "table_a_id" TEXT NOT NULL,
    "table_b_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Relation_table_a_id_fkey" FOREIGN KEY ("table_a_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_table_b_id_fkey" FOREIGN KEY ("table_b_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Relation" ("_id", "createdAt", "table_a_id", "table_b_id", "type") SELECT "_id", "createdAt", "table_a_id", "table_b_id", "type" FROM "Relation";
DROP TABLE "Relation";
ALTER TABLE "new_Relation" RENAME TO "Relation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
