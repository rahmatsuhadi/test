import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "@/service/connection";
import prisma from "@/lib/db";
import { Database } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);
  // const databaseId = (await params).databaseId;
  const tableName = (await params).tableName;

  // Mengambil semua query parameters
  const filters: Record<string, string> = {};
  searchParams.delete("limit");
  searchParams.delete("skip");
  searchParams.forEach((value, key) => {
    filters[key] = value;
  });

  // const where = {
  //   table: { databaseId, name: tableName },
  // };

  try {
    const table = await prisma.table.findFirst({
      include: { database: true },
      where: { name: tableName },
    });
    if (!table) {
      return Response.json({ message: "Table Not Found" }, { status: 404 });
    }
    const database = table.database;

    if (database.type == "mysql") {
      const data = await getMySQLDataByTableName(
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
    } else if (database.type == "mongodb") {
      const data = await getMongoCollectionByName(
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({
        message: error.message,
      });
    } else {
      return Response.json(
        {
          message: "Internal Server Error",
        },
        { status: 500 }
      );
    }
  }
}

const getMySQLDataByTableName = async (
  database: Database,
  name: string,
  limit: number = 20,
  skip: number = 0,
  filters: Record<string, string>
) => {
  const connection = (await connectDatabase(database)) as MysqlConnection;

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
      .filter(([key, i]) => !!i && !!columnsData.find((col) => col.name == key))
      .map(([key, value]) => `${key} = '${value}'`) // Menyesuaikan dengan kondisi yang diinginkan
      .join(" AND ");
  }

  // Menghindari SQL injection dengan validasi nama tabel
  const query = `SELECT \`${fields}\` FROM  ${database.name}.\`${name}\` 
            ${
              filterConditions ? `WHERE ${filterConditions}` : ""
            } LIMIT ${limit} OFFSET ${skip}`;

  const [columns] = await connection.query(query);
  // return { columns};
  // }));
  return columns;
};

const getMongoCollectionByName = async (
  database: Database,
  tableName: string,
  limit: number = 20,
  skip: number = 0,
  filters: Record<string, string>
) => {
  const connection = (await connectDatabase(database)) as MongoConnection;
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
  { params }: { params: Promise<{ databaseId: string; tableName: string }> }
) {
  try {
    const databaseId = (await params).databaseId;
    const tableName = (await params).tableName;
    const req = await request.json();

    const table = await prisma.table.findFirstOrThrow({
      include: { database: true },
      where: { name: tableName, databaseId },
    });
    const database = table.database;

    if (database.type == "mysql") {
      await insertRecordMysql(database,tableName, req);

      return Response.json(req);
    } else if (database.type == "mongodb") {
      const result = await insertRecordMongoDD(
        database,
        tableName,
        req
      );
      return Response.json(result);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 400 }
      );
    }
  }
}
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const insertRecordMysql = async (
  database: Database,
  name: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  body: any
) => {
  // Menghindari SQL injection dengan validasi nama tabe
  // l
  const connection = (await connectDatabase(database)) as MysqlConnection;
  // Menghindari SQL injection dengan validasi nama tabel
  const fields = Object.keys(body)
    .map((field) => `\`${field}\``)
    .join(", ");
  const values = Object.values(body)
    .map((value) => `'${value}'`)
    .join(", ");

  const query = `INSERT INTO \`${database.name}\`.\`${name}\` (${fields}) VALUES (${values})`;

  const [result] = await connection.query(query);

  return result;
};

const insertRecordMongoDD = async (
  database: Database,
  name: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  body: any
) => {
  const connection = (await connectDatabase(database)) as MongoConnection;
  const manager = await connection.db(database.name);

  const collection = await manager.collection(name);

  const result = await collection.insertOne(body);
  return result;
};
