"use client"    
import { fetchColumnByTableName, fetchDataByTableName, fetchTables, findTablesAll } from "@/service/api"
import { Table } from "@prisma/client";
import { useQuery } from "@tanstack/react-query"



export const useTables = (database:string) =>{
    return useQuery<{data:Table[], limit:number, skip:number, total:number}, Error>({
        queryKey: ['tables', database],
        queryFn: () => findTablesAll(database),
    });
}




export const useData = (db:string, tableName:string) =>{
    return useQuery({
        queryKey: ['data', db, tableName],
        queryFn: ()=> fetchDataByTableName(db, tableName)
    })
}
