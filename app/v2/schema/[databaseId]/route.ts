import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  connectDatabase,
  MysqlConnection,
} from "../connection";
import { schemaField } from "./[tableName]/route";
import { Field } from "@prisma/client";

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

    // const db = await getDatabaseById(databaseId);

    const {connection} = await connectDatabase(databaseId);

    await createTableMysql(
      parsedData.name,
      parsedData.columns,
      connection as MysqlConnection
    );

    
    const result = await prisma.table.create({
        include:{
            fields:{
                select: {
                    name:true,
                    type: true,
                    isNull: true
                }
            }
        },
        data:{
            name :parsedData.name,
            fields:{
                createMany:{
                    data: parsedData.columns
                }
            },
            databaseId,
        }
    })



    return Response.json(result);
  } catch (error:unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    if(error instanceof Error){
      return NextResponse.json(
        { message: error?.message ?? "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export const getMySQLTablesByName = async (
  connection: MysqlConnection,
  name: string
) => {
  const [tables] = await connection.query("SHOW TABLES FROM " + name);
  const tableDetails = await Promise.all(
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
    tables.map(async (table: any) => {
      const tableName = table[`Tables_in_${connection.getDatabaseName()}`];
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      return { columns };
    })
  );
  return tableDetails;
};

const createTableMysql = async (
  tableName: string,
  columns: Omit<Field, "id" | "createdAt" | "tableId">[],
  connection: MysqlConnection
) => {
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
        const primaryKey = column.isPrimary ? ' PRIMARY KEY' : '';

        return (
          `${column.name} ${sqlType}${primaryKey}` + (column.isNull ? " NULL" : " NOT NULL")
        );
      })
      .join(", ");

    const query = `CREATE TABLE ${tableName} (${columnsDefinition})`;

    const [table] = await connection.query(query);

    return table;
  
};



