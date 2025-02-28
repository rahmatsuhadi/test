"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDatabase } from "./DatabaseContext";
import { useColumnData } from "@/hooks/useColumn";
import { Field, Relation } from "@prisma/client";
import { useRelationByTableName } from "@/hooks/useRelation";

interface TableContextType {
  tableName: string ;
  columns: Field[];
  relations:Relation[],
  action: string | null,
  setAction: (val:string, open?:boolean) => void
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const action = searchParams.get("action");

  const { databaseId,tableName } = useDatabase();

  const { data: column } = useColumnData(databaseId, tableName);

  const {data:relations} = useRelationByTableName(databaseId, tableName)

  const router = useRouter();
  
  const setAction = useCallback((val:string, open?:boolean) => {
    if(action!=val){
      router.replace(pathname + "?action=" + val);
    }
    else{
      router.replace(pathname)
    }
  },[action])


  return (
    <TableContext.Provider
      value={{
        action, setAction,
        tableName: tableName,
        columns: column && column?.length > 0 ? column : [],
        relations: relations && relations?.length > 0 ? relations : [],
        
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

// Hook untuk menggunakan context
export const useTable = (): TableContextType => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
};
