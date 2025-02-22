import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "@/service/connection";
import prisma from "@/lib/db";
import { Database, Field, Table } from "@prisma/client";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { QueryTypes } from "sequelize";

interface DataRecord {
  [key: string]: string | number | boolean | null;
}

export async function GET(
  {}: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      databaseId: string;
      tableName: string;
      recordId: string;
    }>;
  }
) {
  const { databaseId, tableName, recordId } = await params;

  try {
    const table = await getTable(databaseId, tableName);

    if (!table) {
      return createErrorResponse("Table Not found", 404);
    }
    const database = table.database

    return database.type === "mysql"
      ? await handleMysqlRequest(database, table, recordId)
      : await handleMongodbRequest(
          database,
          table,
          recordId
        );
  } catch (error) {
    return handleError(error);
  }
}

async function getTable(databaseId: string, tableName: string) {
  return await prisma.table.findFirst({
    where: { name: tableName, databaseId },
    include: { database: true, fields: true },
  });
}

async function handleMysqlRequest(
  database: Database,
  table: Table & { fields: Field[] },
  recordId: string
) {


  const data = await getRecordByPrimaryKey(database, table, recordId);

  return !data
    ? createErrorResponse(`Record ${recordId} not found`, 404)
    : Response.json(data);
}

 const getRecordByPrimaryKey = async (
  database: Database,
  table: Table & { fields: Field[] },
  recordId: string
): Promise<DataRecord | null> => {
  const primary = table.fields.find((col) => col.isPrimary);
  const connection= await connectDatabase(database) as MysqlConnection;
  if (!primary) {
    throw new Error(`This Table '${table.name}' does not have a Primary Key`);
  }

  const fields = table.fields.map((val) => val.name).join("`, `");
  const dataQuery = `SELECT \`${fields}\` FROM \`${database.name}\`.\`${
    table.name
  }\` WHERE ${table.name}.${primary.name} = '${recordId}';`;

 
    const [records] = await connection.query<DataRecord>(dataQuery, {
      type: QueryTypes.SELECT,
    });
    return records;
 
};

async function handleMongodbRequest(
  database: Database,
  table: Table & { fields: Field[] },
  recordId: string
) {
  
  const connection = await connectDatabase(database) as MongoConnection;

  const data = await getRecordByIdMongodb(
    connection,
    database,
    table,
    recordId
  );
  return !data
    ? createErrorResponse(`Record ${recordId} not found`, 404)
    : Response.json(data);
}

 const getRecordByIdMongodb = async (
  connection: MongoConnection,
  database: Database,
  table: Table & { fields: Field[] },
  recordId: string
): Promise<DataRecord | null> => {
  const manager = await connection.db(database.name);
  const collection = await manager.collection(table.name);

  const fieldsData = await prisma.field.findMany({
    where: { table: { databaseId: database.id, name: table.name } },
    select: { name: true },
  });

  const fields = fieldsData.map((val) => val.name);
  const query = { _id: new ObjectId(recordId) };

  return await collection.findOne(query, {
    projection: fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {}),
  });
};

function createErrorResponse(message: string, status: number) {
  return Response.json({ message }, { status });
}

function handleError(error: unknown) {
  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }
  return createErrorResponse("Internal Server Error", 500);
}

//  async function GET(
//   {}: NextRequest,
//   {
//     params,
//   }: {
//     params: Promise<{
//       databaseId: string;
//       tableName: string;
//       recordId: string;
//     }>;
//   }
// ) {
//   const databaseId = (await params).databaseId;
//   const tableName = (await params).tableName;
//   const recordId = (await params).recordId;

//   try {
//     const { database, connection } = await connectDatabase(databaseId);

//     const table = await prisma.table.findFirst({
//       where: { name: tableName, databaseId: database.id },
//       include: { database: true, fields: true },
//     });

//     if (!!!table) {
//       return Response.json({ message: "Table Not found" }, {status:404});
//     }

//     if (database.type == "mysql") {
//       const data = await getRecordByPrimaryKey(
//         connection as MysqlConnection,
//         table,
//         recordId
//       );

//       if (data.length == 0) {
//         return Response.json({ message: "Record " + recordId + " not found" }, {status:404});
//       }

//       return Response.json(data);
//     } else if (database.type =="mongodb") {
//       const data = await getRecordByIdMongodb(
//         connection as MongoConnection,
//         database,
//         table,
//         recordId
//       );

//       if (!data) {
//         return Response.json({ message: "Record " + recordId + " not found" }, {status:404});
//       }
//       return Response.json(data)

//     }
//   } catch (error: unknown) {
//     if(error instanceof Error){
//       return Response.json({
//         message: error.message,
//       });
//     }
//     else{
//       return Response.json({message: "Internal Server Error"},{status:500})
//     }
//   }
// }

// export const getRecordByPrimaryKey = async (
//   connection: MysqlConnection,
//   table: Table & { fields: Field[] },
//   recordId: string
//   // eslint-disable-next-line  @typescript-eslint/no-explicit-any
// ): Promise<any> => {
//   if (!table) {
//     throw new Error("Table not found");
//   }

//   const columnsData = table.fields;

//   const primary = columnsData.find((col) => col.isPrimary);
//   if (!primary) {
//     throw new Error(`This Table '${table.name}' Not have Primary Key`);
//   }

//   const fields = columnsData.map((val) => val.name).join("`, `");

//   const dataQuery = `SELECT \`${fields}\` FROM ${connection.getDatabaseName()}.${
//     table.name
//   } where ${table.name}.${primary.name} = '${recordId}';`;

//   const [records] = await connection.query(dataQuery);

//   return records;
// };

// export const getRecordByIdMongodb = async (
//   connection: MongoConnection,
//   database: Database,
//   table: Table & { fields: Field[] },
//   recordId: string
// ) => {

//   const manager = await connection.db(database.name);

//   const collection = await manager.collection(table.name);

//   const columnsData = await prisma.field.findMany({
//     where: {
//       table: {
//         databaseId: database.id,
//         name: table.name,
//       },
//     },
//     select: {
//       name: true,
//     },
//   });

//   const fields = columnsData.map((val) => val.name);

//   const query = {
//     _id: new ObjectId(recordId)
//   };

//   const find = await collection
//   .findOne(query, { projection: fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {}) });

//   return find
// };

// export async function DELETE(
//  {}: NextRequest,
//   {
//     params,
//   }: {
//     params: Promise<{
//       databaseId: string;
//       tableName: string;
//       recordId: string;
//     }>;
//   }
// ) {
//   console.log("hai", params)
//   const databaseId = (await params)?.databaseId;
//   const tableName = (await params).tableName;
//   const recordId = (await params).recordId;
//   try {
//     const { database, connection } = await connectDatabase(databaseId);

//     const table = await prisma.table.findFirst({
//       where: { name: tableName, databaseId: database.id },
//       include: { database: true, fields: true },
//     });

//     if (!!!table) {
//       return Response.json({ message: "Table Not found" }, {status:404});
//     }

//     if (database.type == "mysql") {
//       const data = await deleteRecordMysqlByPrimary(
//         connection as MysqlConnection,
//         databaseId,
//         table,
//         recordId
//       );

//       if (data.length == 0) {
//         return Response.json({ message: "Record " + recordId + " not found" }, {status:404});
//       }

//       return Response.json({message: "Record " + recordId + " deleted"});
//     } else if (database.type=="mongodb") {
//       const data = await deleteRecordByIdMongodb(
//         connection as MongoConnection,
//         database,
//         table,
//         recordId
//       );

//       if (!data) {
//         return Response.json({ message: "Record " + recordId + " not found" }, {status:404});
//       }
//       return Response.json({message: "Record " + recordId + " deleted"});

//     }
//   } catch (error: unknown) {
//     if(error instanceof Error){
//       return Response.json({
//         message: error.message,
//       });
//     }
//     else{
//        return Response.json({
//         message: "Internal Server Erro"
//        },{status:500})
//     }
//   }
// }

// const deleteRecordMysqlByPrimary = async(
//   connection: MysqlConnection,
//   databaseId: string,
//   table: Table & { fields: Field[] },
//   recordId: string
// ) =>{

//   const columnsData = table.fields;

//   const primary = columnsData.find((col) => col.isPrimary);

//   if (!primary) {
//     throw new Error(`This Table '${table.name}' Not have Primary Key`);
//   }

//   // const fields = columnsData.map((val) => val.name).join("`, `");

//   const dataQuery = `DELETE FROM ${connection.getDatabaseName()}.${
//     table.name
//   } where ${table.name}.${primary.name} = '${recordId}';`;

//   const [records] = await connection.query(dataQuery);
//   return records;

// }

// export const deleteRecordByIdMongodb = async (
//   connection: MongoConnection,
//   database: Database,
//   table: Table & { fields: Field[] },
//   recordId: string
// ) => {

//   const manager = await connection.db(database.name);

//   const collection = await manager.collection(table.name);

//   const query = {
//     _id: new ObjectId(recordId)
//   };

//   const deleteRecord = await collection
//   .deleteOne(query);
//   return deleteRecord
// };
