import {
  connectDatabase,
  getDatabaseCredentials,
  getMySQLColumnByTableName,
  getMySQLDataByTableName,
  getMySQLTables,
  getMySQLTablesByName,
  MongoConnection,
  MysqlConnection,
} from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { database: db, table: tableName } = req.query;

  if (req.method === "GET") {
    try {
      const database = await getDatabaseCredentials(db as string);
      

      if (database?.type == "mysql") {
        const connect = (await connectDatabase(
          db as string
        )) as MysqlConnection;

        const columns = await getMySQLDataByTableName(
          connect,
          tableName as string
        );
        res.status(200).json(columns);
      } else if (database?.type == "mongodb") {
        const connect = (await connectDatabase(
          db as string
        )) as MongoConnection;

        const mongodb = await connect.db(database.name);
        const table = await mongodb
          .collection(tableName as string)
          .find({})
          .toArray();

        res.status(200).json(table);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch database" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
