import prisma from "@/lib/db";
import { NextRequest } from "next/server";
import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "../../../../../service/connection";
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

  if (data.type == "mysql") {
    await migrateDatabaseMysql(data);
  } else if (data.type == "mongodb") {
    await migrateDatabaseMongo(data);
  }

  return Response.json({ message: "Success" });
}

 const getMySQLTables = async (database:Database) => {
  
  const connection = await connectDatabase(database) as MysqlConnection;
  const [tables] = await connection.query(`SHOW TABLES FROM \`${database.name}\``);

  const tableDetails = await Promise.all(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    tables.map(async (table: any) => {
      
      const tableName = table[`Tables_in_${database.name}`];
      // const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      return { name: tableName };
    })
  );
  return tableDetails;
};

 const getMySQLColumnByTableName = async (
  connection: MysqlConnection,
  name: string,
  database:Database
) => {
  // const [tables] = await connection.query("SHOW TABLES FROM " + name );

  // const tableDetails = await Promise.all(tables.map(async (table: any) => {
  // const tableName = table[`Tables_in_${connection.getDatabaseName()}`];
  const [columns] = await connection.query(`DESCRIBE ${database.name}.${name}`);
  // return { columns};
  // }));
  return columns as IField[];
};

//  const getMySQLDataByTableName = async (
//   connection: MysqlConnection,
//   name: string
// ) => {
//   const columnsData = await prisma.field.findMany({
//     where: {
//       table: {
//         name: name,
//       },
//     },
//     select: {
//       name: true,
//     },
//   });

//   const fields = columnsData.map((val) => val.name).join("`, `");

//   // Menghindari SQL injection dengan validasi nama tabel
//   const query = `SELECT \`${fields}\` FROM \`${name}\` LIMIT 25`;

//   const [columns] = await connection.query(query);
//   // return { columns};
//   // }));
//   return columns;
// };

interface IForeign {
  local_column: string;
  local_table: string;
  foreign_table: string;
  foreign_column: string;
}

 const getForeignKeysByTableName = async (
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

 const migrateDatabaseMysql = async (database:Database
) => {
  
  const connection = await connectDatabase(database) as MysqlConnection;

  await prisma.relation.deleteMany({
    where: {
      OR:[{
        tableA:{
          databaseId:database.id
        },        
        tableB:{
          databaseId:database.id
        }
      }]
    },
  });
  console.log("DELETING RELATION")
  //
  await prisma.field.deleteMany({
    where: {
      table: {
        databaseId:database.id,
      },
    },
  });
  console.log("DELETING FIELD ")

  await prisma.table.deleteMany({
    where: {
      databaseId:database.id,
    },
  });
  
  console.log("DELETING TABLE")

  const tablesDatabase = await getMySQLTables(database);

  // tablesDatabase.forEach(async (tb) => {
  const resultsTable:Table[] = [];
  const resultsColumn:({ table: { name: string } } & Field)[] = [];

  for (const tb of tablesDatabase) {
    // let tableId: string;

    const res = await prisma.table.create({
      data: {
        name: tb.name,
        databaseId: database.id,
      },
    });
    resultsTable.push(res);

    const columnsDatabases = await getMySQLColumnByTableName(
      connection,
      tb.name,
      database
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

 const migrateDatabaseMongo = async (
  database: Database
) => {
  try {
    
  const connection = await connectDatabase(database) as MongoConnection;
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
