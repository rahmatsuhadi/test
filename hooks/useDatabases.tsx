"use client"    
import {
    useQuery,
  } from '@tanstack/react-query'
import { Database } from "@prisma/client";
import { fetchDatabases, fetchDatabasesById, findDatabasesAll } from "@/service/api";


export const useDatabases = () =>{
    return useQuery<{data:Database[], total:number, skip:number, limit:number}, Error>({
        queryKey: ['databases'],
        queryFn: findDatabasesAll
    });
}


export const useDatabasesById = (id:string) =>{
    return useQuery<Database, Error>({
        queryKey: ['databases', id],
        queryFn: () => fetchDatabasesById(id)
    });
}

