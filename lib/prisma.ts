import { PrismaClient } from '@prisma/client/';

export const prismaApp = new PrismaClient();
const prismaClients: { [key: string]: PrismaClient } = {};

async function getDatabaseInfo(id: string) {
  const database = await prismaApp.database.findUnique({
    where: { id },
  });
  return database;
}

export async function getPrismaClient(databaseId: string): Promise<PrismaClient> {
  if (prismaClients[databaseId]) {
    return prismaClients[databaseId];
  }

  const dbInfo = await getDatabaseInfo(databaseId);

  if (!dbInfo) {
    throw new Error('Database info not found');
  }

  const { type, host, username, password, port } = dbInfo;

  const url = createDatabaseUrl(type, host, username, password, port);

  const prismaClient = new PrismaClient({
    datasources: {    
      db: {
        url,
      },
    },
  });

  prismaClients[databaseId] = prismaClient;

  return prismaClient;
}

function createDatabaseUrl(type: string, host: string, username: string, password: string, port?: number) {
  switch (type) {
    case 'mongodb':
      return `mongodb://${username}:${password}@${host}:${port}/mydatabase`;
    case 'mysql':
      return `mysql://${username}:${password}@${host}:${port}/mydatabase`;
    // Tambahkan jenis database lain sesuai kebutuhan
    default:
      throw new Error('Unsupported database type');
  }
}



// if(db.type =="mongodb"){
//     url = `mongodb+srv://${db.username}:${db.password}@${db.host}/${db.name}`
// }
// else if(db.type=="mysql"){
//     url = `mysql://${db.username}:${db.password}@${db.host}:${db.port || 3306}/${db.name}`
// }
// else if(db.type=="pg"){
//     url = `postgresql://${db.username}:${db.password}@${db.host}:${db.port || 5432}/${db.name}?schema=sample`
// }
// else{
//     throw new Error("Type database not support")
// }
