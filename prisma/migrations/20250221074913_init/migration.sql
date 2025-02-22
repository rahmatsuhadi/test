-- CreateTable
CREATE TABLE "User" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Database" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Table" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "database_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Table_database_id_fkey" FOREIGN KEY ("database_id") REFERENCES "Database" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Field" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isNull" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "table_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Field_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relation" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "table_a_id" INTEGER NOT NULL,
    "table_b_id" INTEGER NOT NULL,
    "field_a_id" INTEGER NOT NULL,
    "field_b_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Relation_table_a_id_fkey" FOREIGN KEY ("table_a_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_table_b_id_fkey" FOREIGN KEY ("table_b_id") REFERENCES "Table" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_field_a_id_fkey" FOREIGN KEY ("field_a_id") REFERENCES "Field" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_field_b_id_fkey" FOREIGN KEY ("field_b_id") REFERENCES "Field" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
