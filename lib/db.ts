import { IField } from "@/types/mysql-type";
import { Prisma, PrismaClient } from "@prisma/client";
import { MongoClient } from "mongodb";

import { Sequelize } from "sequelize";
import { getColumnTypeMysql } from "./mysql/filed-getter";

const prisma = new PrismaClient();
export default prisma;
type DatabaseConnection = Sequelize | MongoClient;

export type MysqlConnection = Sequelize;
export type MongoConnection = MongoClient;

export const getDatabaseCredentials = async (id: string) => {
  const credential = await prisma.database.findUnique({
    where: { id },
  });
  return credential;
};

export const connectDatabase = async (
  id: string
): Promise<DatabaseConnection> => {
  const db = await getDatabaseCredentials(id);

  if (!db) throw new Error("Database not found");

  console.log(db)

  if (db.type == "mysql") {
    const sequelize = new Sequelize(db.name, db.username, db.password, {
      host: db.host,
      dialect: "mysql",
    });

    return sequelize;
  } else if (db.type == "mongodb") {
    const mongoClient = new MongoClient(
      `mongodb+srv://${db.username}:${db.password}@${db.host}/${db.name}`
    );
    await mongoClient.connect();
    return mongoClient;
  } else {
    throw new Error("Unsupported database type");
  }
};

export const getMySQLTables = async (connection: MysqlConnection) => {
  const [tables] = await connection.query("SHOW TABLES");

  const tableDetails = await Promise.all(
    tables.map(async (table: any) => {
      const tableName = table[`Tables_in_${connection.getDatabaseName()}`];
      // const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      return { name: tableName };
    })
  );
  return tableDetails;
};

export const getMySQLTablesByName = async (
  connection: MysqlConnection,
  name: string
) => {
  const [tables] = await connection.query("SHOW TABLES FROM " + name);

  const tableDetails = await Promise.all(
    tables.map(async (table: any) => {
      const tableName = table[`Tables_in_${connection.getDatabaseName()}`];
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      return { columns };
    })
  );
  return tableDetails;
};

export const getMySQLColumnByTableName = async (
  connection: MysqlConnection,
  name: string
) => {
  // const [tables] = await connection.query("SHOW TABLES FROM " + name );

  // const tableDetails = await Promise.all(tables.map(async (table: any) => {
  // const tableName = table[`Tables_in_${connection.getDatabaseName()}`];
  const [columns] = await connection.query(`DESCRIBE ${name}`);
  // return { columns};
  // }));
  return columns as IField[];
};

export const getMySQLDataByTableName = async (
  connection: MysqlConnection,
  name: string
) => {
  const columnsData = await prisma.field.findMany({
    where: {
      table: {
        name: name,
      },
    },
    select: {
      name: true,
    },
  });

  const fields = columnsData.map((val) => val.name).join("`, `");

  // Menghindari SQL injection dengan validasi nama tabel
  const query = `SELECT \`${fields}\` FROM \`${name}\` LIMIT 25`;

  const [columns] = await connection.query(query);
  // return { columns};
  // }));
  return columns;
};

export const migrateDatabase = async (
  connection: MysqlConnection,
  databaseId: string
) => {
  const tables = await prisma.table.findMany({
    where: {
      databaseId: databaseId,
    },
  });

  const tablesDatabase = await getMySQLTables(connection);

  // tablesDatabase.forEach(async (tb) => {
  for (const tb of tablesDatabase) {
    let tableId: string;

    const exist = tables.find((it) => it.name === tb.name);

    if (!!!exist) {
      const res = await prisma.table.create({
        data: {
          name: tb.name,
          databaseId: databaseId,
        },
      });
      tableId = res.id;
    } else {
      tableId = exist.id;
    }

    const columnsDatabases = await getMySQLColumnByTableName(
      connection,
      tb.name
    );

    const columns = await prisma.field.findMany({
      where: {
        table: {
          name: tb.name,
          databaseId: databaseId,
        },
      },
    });

    for (const col of columnsDatabases) {
      if (!!!columns.find((i) => i.name == col.Field)) {
        const type = getColumnTypeMysql(col.Type);
        await prisma.field.create({
          data: {
            name: col.Field,
            type: type,
            isPrimary: col.Key == "PRI",
            tableId: tableId,
            isNull: col.Null == "NO" ? false : true,
          },
        });
        console.log({ message: `Column ${col.Field} is CREATED` });
      }
    }
  }
};
