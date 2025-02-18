"use client";
import {
  fetchColumnByTableName,
  fetchDataByTableName,
  fetchTables,
  findColumnAll,
  findColumnById,
  findTablesAll,
} from "@/service/api";
import { Table } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";





export const useColumnByTableName = (
  db: string,
  tableName: string,
) => {
  return useQuery({
    queryKey: ["columnDetail", db],
    queryFn: () => findColumnAll(db, tableName),
  });
};

export const useColumnData = (db:string, tableName:string) =>{
    return useQuery({
        queryKey: ['column', db, tableName],
        queryFn: ()=> fetchColumnByTableName(db, tableName)
    })
}
