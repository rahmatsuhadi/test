"use client"    
import {
    useQuery,
  } from '@tanstack/react-query'
import { Database } from "@prisma/client";
import {findDatabasesAll } from "@/service/api";


export const useDatabases = () =>{
    return useQuery<Database[], Error>({
        queryKey: ['databases'],
        queryFn: findDatabasesAll
    });
}

