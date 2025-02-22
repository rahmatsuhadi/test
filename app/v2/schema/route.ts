import prisma from "@/lib/db";
import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "@/service/connection";
import { Database } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schemaDatabase = z.object({
  name: z.string(),
  type: z.enum(["mysql", "mongodb"]),
  uri: z.string(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);

  const data = await prisma.database.findMany({
    take: limit,
    skip: skip,
  });

  const count = await prisma.database.count();

  return Response.json({
    data: data,
    limit,
    skip,
    total: count,
  });
}

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();

    const parsedData = schemaDatabase.parse(res);

    const result = await prisma.database.create({
      data: parsedData,
    });
    if(result.type=="mysql"){
       await createDatabaseMysql(result)

    }else if(result.type=="mongodb"){
      await createMongoDatabase(result);

    }

    return Response.json(result);
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const createDatabaseMysql = async (database: Database) => {
  const connection = await connectDatabase(database)  as MysqlConnection;


  await connection.query(`CREATE DATABASE IF NOT EXISTS ${database.name}`);
  console.log("Database created successfully!");
};
const createMongoDatabase = async (database: Database) => {
  const connection = await connectDatabase(database) as MongoConnection;

  const db = connection.db(database.name);

  // Cek apakah database sudah ada
  const collections = await db.listCollections().toArray();
  if (collections.length === 0) {
    console.log("Database created successfully!");
  } else {
    console.log("Database already exists.");
  }
};
