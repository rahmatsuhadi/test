import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "@/app/v2/schema/connection";
import prisma from "@/lib/db";
import { Database, Field, FieldType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);
  const databaseId = (await params).databaseId;
  const tableName = (await params).tableName;

  // Mengambil semua query parameters
  const filters: Record<string, string> = {};
  searchParams.delete("limit");
  searchParams.delete("skip");
  searchParams.forEach((value, key) => {
    filters[key] = value;
  });

  const where = {
    table: { databaseId, name: tableName },
  };

  try {
    const { connection, database } = await connectDatabase(databaseId);

    if (database.type == "mysql") {
      const data = await getMySQLDataByTableName(
        connection as MysqlConnection,
        tableName,
        limit,
        skip,
        filters
      );
      return Response.json({
        data,
        limit,
        skip,
      });
    } else if (database.type == "mongodb") {
      const data = await getMongoCollectionByName(
        connection as MongoConnection,
        database,
        tableName,
        limit,
        skip,
        filters
      );

      return Response.json({
        data,
        limit,
        skip,
      });
    }
  } catch (error: any) {
    return Response.json({
      message: error.message,
    });
  }
}

export const getMySQLDataByTableName = async (
  connection: MysqlConnection,
  name: string,
  limit: number = 20,
  skip: number = 0,
  filters: Record<string, string>
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

  let filterConditions = "";
  if (filters) {
    filterConditions = Object.entries(filters)
      .filter(([key, value]) => !!columnsData.find((col) => col.name == key))
      .map(([key, value]) => `${key} = '${value}'`) // Menyesuaikan dengan kondisi yang diinginkan
      .join(" AND ");
  }

  // Menghindari SQL injection dengan validasi nama tabel
  const query = `SELECT \`${fields}\` FROM \`${name}\` 
            ${
              filterConditions ? `WHERE ${filterConditions}` : ""
            } LIMIT ${limit} OFFSET ${skip}`;

  const [columns] = await connection.query(query);
  // return { columns};
  // }));
  return columns;
};

export const getMongoCollectionByName = async (
  connection: MongoConnection,
  database: Database,
  tableName: string,
  limit: number = 20,
  skip: number = 0,
  filters: Record<string, string>
) => {
  const manager = await connection.db(database.name);

  const collection = await manager.collection(tableName);

  const columnsData = await prisma.field.findMany({
    where: {
      table: {
        databaseId: database.id,
        name: tableName,
      },
    },
    select: {
      name: true,
    },
  });

  const fields = columnsData.map((val) => val.name);

  const query = {
    ...filters,
  };

  const find = await collection
    .find(query)
    .project(fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {}))
    .skip(skip)
    .limit(limit)
    .toArray();

  return find;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string, tableName:string}> }
) {
  try {
    const databaseId = (await params).databaseId;
    const tableName = (await params).tableName;
    const req = await request.json();

    const { connection, database } = await connectDatabase(databaseId);

    if(database.type=="mysql"){
      
      const data =  await insertRecordMysql(connection as MysqlConnection, tableName,req)
      
      return Response.json(req);
    }
    else if(database.type=="mongodb"){

     const result =  await insertRecordMongoDD(connection as MongoConnection, database, tableName, req)
      return Response.json(result);
    }
    

  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? "Internal Server Error" },
      { status: 400 }
    );
  }
}

const insertRecordMysql = async (connection: MysqlConnection, name: string, body:any) => {
  // Menghindari SQL injection dengan validasi nama tabe
  // l
 // Menghindari SQL injection dengan validasi nama tabel
 const fields = Object.keys(body).map(field => `\`${field}\``).join(', ');
 const values = Object.values(body).map(value => `'${value}'`).join(', ');

 const query = `INSERT INTO \`${name}\` (${fields}) VALUES (${values})`;

  const [result] = await connection.query(query);

  return result;
};


const insertRecordMongoDD = async (connection: MongoConnection,database:Database, name: string, body:any) => {
  
  const manager = await connection.db(database.name)

  const collection = await manager.collection(name);

 const result =  await collection.insertOne(body)
  return result
};




