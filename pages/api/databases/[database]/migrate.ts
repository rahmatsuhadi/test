import {
  connectDatabase,
  getDatabaseCredentials,
  getMySQLTables,
  migrateDatabase,
  MongoConnection,
  MysqlConnection,
} from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { database: db } = req.query;

  if (req.method === "GET") {
    try {
    const databaseId = db as string

      const database = await getDatabaseCredentials(databaseId);

      if (database?.type == "mysql") {
        const connect = (await connectDatabase(
          databaseId
        )) as MysqlConnection;

        const tables = await getMySQLTables(connect);

        const cek = await migrateDatabase(connect, databaseId)



        res.status(200).json({ database, tables });
      } else if (database?.type == "mongodb") {
        const connect = (await connectDatabase(
          db as string
        )) as MongoConnection;
        const mongodb = await connect.db(database.name);

        const tables = await mongodb.listCollections().toArray();

        res.status(200).json({
          database,
          tables: tables.map((item) => {
            return { name: item.name };
          }),
        });
      }
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: "Failed to fetch database" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
