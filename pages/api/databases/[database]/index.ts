
import { connectDatabase, getDatabaseCredentials, getMySQLTables, MongoConnection, MysqlConnection } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { database:db } = req.query;

  if (req.method === 'GET') {
    try {
      const database = await getDatabaseCredentials(db as string);
      
      if(database?.type=="mysql"){
        const connect = await connectDatabase(db as string) as MysqlConnection;

        const tables = await getMySQLTables(connect)
        res.status(200).json({database,tables});
      }
      else if(database?.type=="mongodb"){
        
        const connect = await connectDatabase(db as string) as MongoConnection;
        const mongodb = await connect.db(database.name)

        const tables = await mongodb.listCollections().toArray()  

        res.status(200).json({database, tables:tables.map(item =>{ return {name:item.name}})})

      }
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch database' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
