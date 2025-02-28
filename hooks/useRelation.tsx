
"use client"    
import {createTable, findAll, findRelationByTableName, findTablesAll } from "@/service/api"
import { Table } from "@prisma/client";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"


export const useRelationByTableName = (db:string, tableName:string) =>{
    return useQuery({
        queryKey: ['relation-table', db, tableName],
        queryFn: ()=> findRelationByTableName(db, tableName)
    })
}
