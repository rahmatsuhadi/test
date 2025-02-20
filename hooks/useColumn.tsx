"use client";
import {
  findColumnAll,
  findColumnById,
  findTableByName,
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
        queryFn: ()=> findTableByName(db, tableName)
    })
}
