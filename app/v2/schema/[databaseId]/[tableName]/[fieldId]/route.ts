import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDatabase, MysqlConnection } from "../../../../../../service/connection";
import { Database } from "@prisma/client";


export async function GET(
  {}: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string, fieldId:string }> }
) {
  // const databaseId = (await params).databaseId;
  // const tableName = (await params).tableName;
  const fieldId = (await params).fieldId;

  // const where = {
  //   table: { databaseId, name: tableName},
  //   id:fieldId 
  // };

  const data = await prisma.field.findFirst({
    where:{
        id: fieldId,
    }
  });

  return Response.json({
    data: data
  });
}



// delete table

export async function DELETE(
  {}: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string, fieldId:string }> }
) {
  try {
    // const databaseId = (await params).databaseId;
    const tableName = (await params).tableName;
    const fieldId = (await params).fieldId;

    const field = await prisma.field.findFirst({
      include:{table:{select:{database:true}}},
      where: {
        id: fieldId
      },
    });

    if (!field) {
      return Response.json({ message: `Field ${fieldId} Not Found` },{status: 404});
    }
    const database = field.table.database;

    //   const db = await getDatabaseById(databaseId);


    if(database.type=="mysql"){
      await deleteTableMysql(tableName, field.name, database);
    }



    const result = await prisma.field.delete({
      where: {
        id: fieldId
      },
    });

    return Response.json(result);
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    else if(error instanceof Error){

      return NextResponse.json(
        { message: error?.message ?? "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

const deleteTableMysql = async (
  tableName: string,
  columnName:string,
  database: Database
) => {
    
  const connection = (await connectDatabase(database)) as MysqlConnection;
  const query = `ALTER TABLE  ${database.name}.${tableName} DROP COLUMN ${columnName};`;

  const [table] = await connection.query(query);

  return table;
};
