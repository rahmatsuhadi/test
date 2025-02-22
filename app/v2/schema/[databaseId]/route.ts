import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "../../../../service/connection";
import { Database, Field } from "@prisma/client";



const schemaField = z.object({
  name: z.string(),
  type: z.enum([ "STRING", "BOOLEAN", "INT"]),
  isNull: z.boolean(),
  isPrimary: z.boolean(),
});

const schemaTable = z.object({
  name: z.string(),
  columns: schemaField.array().min(1, "At least one column is required"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);
  const databaseId = (await params).databaseId;

  const data = await prisma.table.findMany({
    take: limit,
    skip: skip,
    where: { databaseId },
  });

  const count = await prisma.table.count({ where: { databaseId } });

  return Response.json({
    data: data,
    limit,
    skip,
    total: count,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string }> }
) {
  try {
    const databaseId = (await params).databaseId;
    const res = await request.json();
    const parsedData = schemaTable.parse(res);

    const credential = await prisma.database.findUniqueOrThrow({
      where: { id:databaseId },
    });

    if(credential.type=="mysql"){
      await createTableMysql(parsedData.name, parsedData.columns, credential)
    }

    else if(credential.type=="mongodb"){
      await createTableMongo(parsedData.name, parsedData.columns, credential)
    }

    const result = await prisma.table.create({
      include: {
        fields: {
          select: {
            name: true,
            type: true,
            isNull: true,
          },
        },
      },
      data: {
        name: parsedData.name,
        fields: {
          createMany: {
            data: parsedData.columns,
          },
        },
        databaseId,
      },
    });

    return Response.json(result);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error?.message ?? "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

 const createTableMongo = async (
  tableName: string,
  columns: Omit<Field, "id" | "createdAt" | "tableId">[],
  database: Database,
) => {


  const connection = await connectDatabase(database) as MongoConnection;

  const mongodb = await connection.db(database.name);

  const dummy: Record<string, unknown> = {};

  for (const col of columns) {
    switch (col.type) {
      case "INT":
        dummy[col.name] = 0;

        break;

      case "BOOLEAN":
        dummy[col.name] = false;

        break;

      case "STRING":
        dummy[col.name] = "";

        break;

      case "DATETIME":
        dummy[col.name] = new Date().toISOString();

        break;

      default:
        break;
    }
  }

  const collection = await mongodb.createCollection(tableName);
  await collection.insertOne(dummy);
  return collection;
};

//  const getMySQLTablesByName = async (
//   connection: MysqlConnection,
//   name: string
// ) => {
//   const [tables] = await connection.query("SHOW TABLES FROM " + name);
//   const tableDetails = await Promise.all(
//     // eslint-disable-next-line  @typescript-eslint/no-explicit-any
//     tables.map(async (table: any) => {
//       const tableName = table[`Tables_in_${connection.getDatabaseName()}`];
//       const [columns] = await connection.query(`DESCRIBE ${tableName}`);
//       return { columns };
//     })
//   );
//   return tableDetails;
// };

const createTableMysql = async (
  tableName: string,
  columns: Omit<Field, "id" | "createdAt" | "tableId">[],
  database: Database,
) => {

  

  const connection = await connectDatabase(database) as MysqlConnection;


  const columnsDefinition = columns
    .map((column) => {
      if (!column?.name || !column.type) {
        throw new Error("Each column must have a fieldName and fieldType.");
      }

      let sqlType: string;
      switch (column.type) {
        case "INT":
          sqlType = "INT";
          break;
        case "STRING":
          sqlType = "VARCHAR(255)"; // Atau sesuaikan ukuran sesuai kebutuhan
          break;
        case "BOOLEAN":
          sqlType = "BOOLEAN";
          break;
        default:
          throw new Error(`Unsupported column type: ${column.type}`);
      }
      const primaryKey = column.isPrimary ? " PRIMARY KEY" : "";

      return (
        `${column.name} ${sqlType}${primaryKey}` +
        (column.isNull ? " NULL" : " NOT NULL")
      );
    })
    .join(", ");
    
    const query = `CREATE TABLE ${database.name}.${tableName} (${columnsDefinition})`;

  const [table] = await connection.query(query);

  return table;
};
