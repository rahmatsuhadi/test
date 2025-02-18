
import prisma, { connectDatabase, getDatabaseCredentials, getMySQLColumnByTableName, getMySQLTables, getMySQLTablesByName, MongoConnection, MysqlConnection } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { database:db, table:tableName } = req.query;

  if (req.method === 'GET') {
    try {
      // const database = await getDatabaseCredentials(db as string);

      const fileds = await prisma.field.findMany({
        where:{
          table:{
            name: tableName as string,
            databaseId: db as string
          }
        }
      })

      res.status(200).json(fileds)
      
      
      // if(database?.type=="mysql"){
      //   const connect = await connectDatabase(db as string) as MysqlConnection;

      //   const columns = await getMySQLColumnByTableName(connect, tableName as string)
      //   res.status(200).json({columns});
      // }
      // else if(database?.type=="mongodb"){

      //   const connect = await connectDatabase(db as string) as MongoConnection;

      //   const mongodb = await connect.db(database.name);
      //   const table = await mongodb.collection(tableName as string).findOne({})
      //   if(table){
      //    return res.status(200).json({columns:Object.keys(table).map(item => {return {Field: item} } )});
      //   }
      //   else{
      //     res.status(200).json({columns:[]})
      //   }
        
      // }
      
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Failed to fetch database' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
