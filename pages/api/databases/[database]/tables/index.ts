import prisma, { connectDatabase } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

interface Query {
  db: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query;
  const db = query.database as string;

  if (req.method === "GET") {
    try {
      const response = await prisma.table.findMany({
        where: {
          databaseId: db,
        },
      });

      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
