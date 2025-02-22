/*
  Warnings:

  - The primary key for the `Database` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Field` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Relation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Database" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Database" ("_id", "createdAt", "name", "type", "uri") SELECT "_id", "createdAt", "name", "type", "uri" FROM "Database";
DROP TABLE "Database";
ALTER TABLE "new_Database" RENAME TO "Database";
CREATE TABLE "new_Field" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isNull" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Field_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Field" ("_id", "createdAt", "isNull", "isPrimary", "name", "table_id", "type") SELECT "_id", "createdAt", "isNull", "isPrimary", "name", "table_id", "type" FROM "Field";
DROP TABLE "Field";
ALTER TABLE "new_Field" RENAME TO "Field";
CREATE TABLE "new_Relation" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "table_a_id" TEXT NOT NULL,
    "table_b_id" TEXT NOT NULL,
    "field_a_id" TEXT NOT NULL,
    "field_b_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Relation_table_a_id_fkey" FOREIGN KEY ("table_a_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_table_b_id_fkey" FOREIGN KEY ("table_b_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_field_a_id_fkey" FOREIGN KEY ("field_a_id") REFERENCES "Field" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_field_b_id_fkey" FOREIGN KEY ("field_b_id") REFERENCES "Field" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Relation" ("_id", "createdAt", "field_a_id", "field_b_id", "table_a_id", "table_b_id", "type") SELECT "_id", "createdAt", "field_a_id", "field_b_id", "table_a_id", "table_b_id", "type" FROM "Relation";
DROP TABLE "Relation";
ALTER TABLE "new_Relation" RENAME TO "Relation";
CREATE TABLE "new_Table" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "database_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Table_database_id_fkey" FOREIGN KEY ("database_id") REFERENCES "Database" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Table" ("_id", "createdAt", "database_id", "name") SELECT "_id", "createdAt", "database_id", "name" FROM "Table";
DROP TABLE "Table";
ALTER TABLE "new_Table" RENAME TO "Table";
CREATE TABLE "new_User" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("_id", "createdAt", "name", "password", "username") SELECT "_id", "createdAt", "name", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
