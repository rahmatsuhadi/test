import prisma from "@/lib/db";
import { Database, Field } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDatabase, MongoConnection, MysqlConnection } from "../../../../../service/connection";

 const schemaField = z.object({
  name: z.string(),
  type: z.enum([ "STRING", "BOOLEAN", "INT"]),
  isNull: z.boolean(),
  isPrimary: z.boolean(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);
  const databaseId = (await params).databaseId;
  const tableName = (await params).tableName;

  const where = {
    table: { databaseId, name: tableName },
  };

  const data = await prisma.field.findMany({
    take: limit,
    skip: skip,
    include:{
      table:{select:{id:true}},
      relationsA: {
        select:{
          tableB:{
            select: {name:true}
          },
          fieldB:{
            select:{
              name:true
            }
          },

        }
      }
    },
    orderBy: {
      isPrimary: "desc",
    },
    where: where,
    omit: {
      createdAt: true,
    },
  });

  const count = await prisma.field.count({ where });

  return Response.json({
    data: data,
    limit,
    skip,
    total: count,
  });
}

// create new Field
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string }> }
) {
  try {
    const databaseId = (await params).databaseId;
    const tableName = (await params).tableName;
    const res = await request.json();

    const parsedData = z.object({ columns: schemaField.array() }).parse(res);

    const table = await prisma.table.findFirstOrThrow({
      include:{database:true},
      where:{
        databaseId:databaseId,
        name: tableName
      },
    });
    const database = table.database

    if (!table) {
      return Response.json(
        { message: `Table ${tableName} Not Found` },
        { status: 404 }
      );
    }


    if(database.type=="mysql"){
      await createFieldMysql(tableName, parsedData.columns, database);
    }

    const data = await prisma.field.findMany({
      orderBy: {
        isPrimary: "desc",
      },
      where: {
        table: { databaseId, name: tableName },
        isPrimary: true,
      },
      omit: {
        tableId: true,
        createdAt: true,
      },
    });

    if (!!parsedData.columns.find((item) => item.isPrimary) && !!data) {
      return Response.json(
        { message: "primaryKey is Already Exists" },
        { status: 400 }
      );
    }

    const result = await prisma.field.createMany({
      data: parsedData.columns.map((item) => {
        return { ...item, tableId: table.id };
      }),
    });

    return Response.json(result);
  } catch (error: unknown) {
    console.log(error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    else{
      console.log(error)
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
}

const createFieldMysql = async (
  tableName: string,
  columns: Omit<Field, "id" | "createdAt" | "tableId">[],
  database:Database
) => {

  const connection = await connectDatabase(database) as MysqlConnection

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
        ` ADD COLUMN  ${column.name} ${sqlType}${primaryKey}` +
        (column.isNull ? " NULL" : " NOT NULL")
      );
    })
    .join(", ");


  const query = `ALTER TABLE ${database.name}.${tableName} ${columnsDefinition};`;

  const [table] = await connection.query(query);

  return table;
};

// delete table

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string }> }
) {
  try {
    const databaseId = (await params).databaseId;
    const tableName = (await params).tableName;

    const table = await prisma.table.findFirst({
      include: {database:true},
      where: {
        databaseId,
        name: tableName,
      },
    });

    if (!table) {
      return Response.json({ message: `Table ${tableName} Not Found` });
    }
    const database = table.database

    //   const db = await getDatabaseById(databaseId);


    if(database.type=="mysql"){
      await deleteTableMysql(tableName, database);

    }
    else if(database.type=="mongodb"){
     await deleteTableMongo(tableName, database)
    }


    await prisma.field.deleteMany({
      where: {
        tableId: table.id,
      },
    });

    const result = await prisma.table.delete({
      where: {
        id: table.id,
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
    else if(error instanceof Error){
      console.log(error);
      return NextResponse.json(
        { message: error?.message ?? "Internal Server Error" },
        { status: 500 }
      );

    }
  }
}

const deleteTableMysql = async (
  tableName: string,
  database:Database
) => {
  
  const connection = (await connectDatabase(database)) as MysqlConnection;

  const query = `DROP TABLE ${database.name}.${tableName}`;

  const [table] = await connection.query(query);

  return table;
};

 const deleteTableMongo = async (
  tableName: string,
  database: Database,
) => {

  const connection = (await connectDatabase(database)) as MongoConnection;

  const mongodb = await connection.db(database.name);

 

  const collection = await mongodb.dropCollection(tableName);
  return collection;
};