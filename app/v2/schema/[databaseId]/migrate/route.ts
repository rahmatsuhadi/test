import prisma from "@/lib/db";
import { NextRequest } from "next/server";
import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "../../connection";
import { IField } from "@/types/mysql-type";
import { getColumnTypeMysql } from "@/lib/mysql/filed-getter";
import { Database, Field, Table } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string }> }
) {
  // const searchParams = request.nextUrl.searchParams;
  const databaseId = (await params).databaseId;

  const data = await prisma.database.findUnique({
    where: { id: databaseId },
  });

  if (!data) {
    return Response.json({ message: "Database Not Found" }, { status: 404 });
  }

  const {connection} = await connectDatabase(databaseId);
  if (data.type == "mysql") {
    await migrateDatabaseMysql(connection as MysqlConnection, databaseId);
  } else if (data.type == "mongodb") {
    await migrateDatabaseMongo(connection as MongoConnection, data);
  }

  return Response.json({ message: "Success" });
}

export const getMySQLTables = async (connection: MysqlConnection) => {
  const [tables] = await connection.query("SHOW TABLES");

  const tableDetails = await Promise.all(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    tables.map(async (table: any) => {
      
      const tableName = table[`Tables_in_${connection.getDatabaseName()}`];
      // const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      return { name: tableName };
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

interface IForeign {
  local_column: string;
  local_table: string;
  foreign_table: string;
  foreign_column: string;
}

export const getForeignKeysByTableName = async (
  connection: MysqlConnection,
  tableName: string
) => {
  const query = `
    SELECT 
    kcu.column_name AS local_column,
    kcu.table_name AS local_table,
    kcu.referenced_table_name AS foreign_table,
    kcu.referenced_column_name AS foreign_column
FROM 
    information_schema.KEY_COLUMN_USAGE AS kcu
WHERE 
    kcu.table_schema = '${connection.getDatabaseName()}'
    AND kcu.table_name = '${tableName}'
    AND kcu.referenced_table_name IS NOT NULL;`;

  const [foreignKeys] = await connection.query(query);
  return foreignKeys as IForeign[];
};

export const migrateDatabaseMysql = async (
  connection: MysqlConnection,
  databaseId: string
) => {

  await prisma.relation.deleteMany({
    where: {
      OR:[{
        tableA:{
          databaseId
        },        
        tableB:{
          databaseId
        }
      }]
    },
  });
  console.log("DELETING RELATION")
  //
  await prisma.field.deleteMany({
    where: {
      table: {
        databaseId,
      },
    },
  });
  console.log("DELETING FIELD ")

  await prisma.table.deleteMany({
    where: {
      databaseId,
    },
  });
  
  console.log("DELETING TABLE")

  const tablesDatabase = await getMySQLTables(connection);

  // tablesDatabase.forEach(async (tb) => {
  const resultsTable:Table[] = [];
  const resultsColumn:({ table: { name: string } } & Field)[] = [];

  for (const tb of tablesDatabase) {
    // let tableId: string;

    const res = await prisma.table.create({
      data: {
        name: tb.name,
        databaseId: databaseId,
      },
    });
    resultsTable.push(res);

    const columnsDatabases = await getMySQLColumnByTableName(
      connection,
      tb.name
    );

    for (const col of columnsDatabases) {
      const type = getColumnTypeMysql(col.Type);

      const resField = await prisma.field.create({
        include:{table:{select:{name:true}}},
        data: {
          name: col.Field,
          type: type,
          isPrimary: col.Key == "PRI",
          tableId: res.id,
          isNull: col.Null == "NO" ? false : true,
        },
      });
      resultsColumn.push(resField);
      console.log({ message: `Column ${col.Field} is CREATED` });
    }
  }

  for (const tabRel of resultsTable) {
    const relations = await getForeignKeysByTableName(connection, tabRel.name);

    for (const relation of relations) {
      const localField = resultsColumn.find(
        (fi) => fi.name == relation.local_column && fi.table.name == relation.local_table
      )?.id;
      const targetField = resultsColumn.find(
        (fi) => fi.name == relation.foreign_column && fi.table.name == relation.foreign_table
      )?.id;

      const targetTable = resultsTable.find(
        (fi) => fi.name == relation.foreign_table
      )?.id;


      if (!localField || !targetField || !targetTable) {
        console.log("Relation no valid");
        return;
      }

      await prisma.relation.create({
        data: {
          tableAId: tabRel.id,
          fieldAId: localField,
          type: "ONE_TO_MANY",
          fieldBId: targetField,
          tableBId: targetTable,
        },
      });
    }
    console.log("CREATE RELATION");
  }
};

export const migrateDatabaseMongo = async (
  connection: MongoConnection,
  database: Database
) => {
  try {
    const mongodb = await connection.db(database.name);

    await prisma.field.deleteMany({
      where: {
        table: {
          databaseId: database.id,
        },
      },
    });

    await prisma.table.deleteMany({
      where: {
        databaseId: database.id,
      },
    });

    const tables = await mongodb.listCollections().toArray();

    console.log({ tables: tables }, "MIGRATE TABLE");

    for (const table of tables) {
      const response = await prisma.table.create({
        data: {
          name: table.name,
          databaseId: database.id,
        },
      });

      const collection = await mongodb.collection(table.name);
      const one = await collection.findOne();
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      for (const field of Object.keys(one as any)) {
        await prisma.field.create({
          data: {
            name: field,
            type: "STRING",
            isNull: true,
            isPrimary: field =="_id",
            tableId: response.id,
          },
        });
      }
    }

    // console.log(tables);
  } catch (error) {
    console.log(error)
  }
};
