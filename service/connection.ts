import prisma from "@/lib/db";
import { Database } from "@prisma/client";
import { MongoClient } from "mongodb";
import { Sequelize } from "sequelize";
import mysql from "mysql2"

type DatabaseConnection = Sequelize | MongoClient;

export type MysqlConnection = Sequelize;
export type MongoConnection = MongoClient;

export const getDatabaseById = async (id: string) => {
  const credential = await prisma.database.findUnique({
    where: { id },
  });
  return credential;
};

export const connectDatabase = async (
  db: Database
) => {
  const connections: { [key: string]:  DatabaseConnection} = {};    

  if (connections[db.id]) {
    return connections[db.id];
  }
  
  // const db = await getDatabaseById(id);

  // if (!db) throw new Error("Database not found");

  let connection;

  if (db.type == "mysql") {
    const sequelize = new Sequelize( `${db.uri}`,{
        dialect: "mysql",
        dialectModule: mysql
        // dialectModule: mysql
      });
      connection = sequelize;
    // sequelize
    // .authenticate()
    // .then(() => {
    //   console.log('Connection has been established successfully.');
    // })
    // .catch((error) => {
    //   console.error('Unable to connect to the database:', error);
    // });

    // return {connection:sequelize,database:db};

  } else if (db.type == "mongodb") {
    const mongoClient = new MongoClient(
      `${db.uri}`
    );
    connection = mongoClient;
    // return {connection:mongoClient ,database:db};
  } else {
    throw new Error("Unsupported database type");
  }
  connections[db.id] = connection;
  return connections[db.id] ;
};
