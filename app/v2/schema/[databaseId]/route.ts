import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  connectDatabase,
  MongoConnection,
  MysqlConnection,
} from "../../../../service/connection";
import { Database, Field } from "@prisma/client";
import { CustomError } from "@/types/type.error";
import getModel from "@/lib/mysql/model";
import { DataTypes, ModelAttributes } from "sequelize";

const schemaField = z
  .object({
    name: z.string(),
    type: z.enum(["STRING", "BOOLEAN", "NUMBER", "RELATION", "DATETIME"]),
    isRequired: z.boolean().nullable(),
    relationType: z.enum(["ONE_TO_ONE", "ONE_TO_MANY"]).nullable(),
    relationTable: z.string().nullable(),
    isPrimary: z.boolean().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "RELATION") {
        return data.relationType !== null && data.relationTable !== null;
      }
      return true;
    },
    {
      message:
        "relationType and relationTable are required when type is 'RELATION'",
      path: ["relationType", "relationTable"],
    }
  );

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
      where: { id: databaseId },
    });

    if (credential.type == "mysql") {
      await createTableMysql(parsedData.name, parsedData.columns, credential);
    } else if (credential.type == "mongodb") {
      await createTableMongo(parsedData.name, parsedData.columns, credential);
    }

    const relations = parsedData.columns.filter(
      (col) =>
        col.type == "RELATION" && !!col.relationTable && !!col.relationType
    );

    const result = await prisma.table.create({
      include: {
        fields: {
          select: {
            name: true,
            type: true,
            isRequired: true,
          },
        },
      },
      data: {
        name: parsedData.name,
        relations: {
          createMany: {
            data: relations.map((item) => {
              // if(!!!item.relationTable || !!!item.relationType) return null
              return {
                relationTableId: item.relationTable || "",
                type: item.relationType || "ONE_TO_ONE",
              };
            }),
          },
        },
        fields: {
          createMany: {
            data: parsedData.columns.map((item) => {
              return {
                name: item.name,
                type: item.type,
                isPrimary: item.isPrimary,
                isRequired: item.isRequired,
              };
            }),
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
    } else {
      const customError = error as CustomError;
      console.log(customError.message);
      if (customError.response?.data?.message) {
        return NextResponse.json(
          {
            message:
              customError.response.data.message || customError.message || "Internal Server Error",
          },
          { status: 500 }
        );
      }
    }
  }
}

const createTableMongo = async (
  tableName: string,
  columns: z.infer<typeof schemaField>[],
  database: Database
) => {
  const connection = (await connectDatabase(database)) as MongoConnection;

  const mongodb = await connection.db(database.name);

  const dummy: Record<string, unknown> = {};

  for (const col of columns) {
    switch (col.type) {
      case "NUMBER":
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
  // await collection.insertOne(dummy);
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

const getTableById = async (id: string) => {
  const table = await prisma.table.findFirst({
    where: { id: id },
    select: {
      name: true,
      fields: {
        select: {
          isPrimary: true,
          name: true,
        },
      },
    },
  });
  if (!table) return null;
  const primaryFields = table.fields.filter((field) => field.isPrimary);

  return {
    ...table,
    fields: primaryFields,
  };
};

const createTableMysql = async (
  tableName: string,
  columns: z.infer<typeof schemaField>[],
  database: Database
) => {
  const connection = (await connectDatabase(database)) as MysqlConnection;

  await connection.query(`USE ${database.name}`);

  const queryInterface = await connection.getQueryInterface();

  const tableDefinition: ModelAttributes = {
    // id: {
    //   type: DataTypes.STRING,
    //   primaryKey: true,
    // },
  };

 for (const col of columns ) {
    const dataType =
      col.type === "RELATION"
        ? DataTypes.STRING
        : col.type === "DATETIME"
        ? DataTypes.DATE
        : DataTypes[col.type as keyof typeof DataTypes];

    if (col.type == "RELATION" && col.relationTable) {
      const relationTable = await getTableById(col.relationTable);
      if (relationTable) {
        tableDefinition[col.name] = {
          type: dataType,
          allowNull: col.isRequired !== true,
          primaryKey: col.isPrimary || false,
          references: {
            model: relationTable.name,
            key:
              relationTable.fields.length > 0
                ? relationTable.fields[0].name
                : "_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        };
      }
    } else {
      tableDefinition[col.name] = {
        type: dataType,
        allowNull: col.isRequired !== true,
        primaryKey: col.isPrimary || false,
      };
    }
  };

  console.log(tableDefinition)
  // tableDefinition.createdAt = {
  //   type: DataTypes.DATE,
  //   allowNull: true,
  //   defaultValue: DataTypes.NOW,
  // };

  // tableDefinition.updatedAt = {
  //   type: DataTypes.DATE,
  //   allowNull: true,
  //   defaultValue: DataTypes.NOW,
  // };

  const result = await queryInterface.createTable(tableName, tableDefinition);

  return result;
};
