"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTables } from "@/hooks/useTable";
import { Table } from "@prisma/client";

interface DatabaseContextType {
  databaseId: string ;
  tableName: string ;
  record: string ;
  metadata:Metadata | undefined
  tables: Table[]
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

interface Metadata{
  id:string,
  type: string,
  name:string
}

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const databaseId = parts[2]; //  db_2bd07aa3c2
  const tableName = parts[3]; //  users
  const record = parts[4]; //  123adsf

  const [metadata, setMetadata] = useState<Metadata>()

  const { data:tables } = useTables(databaseId as string);


  useEffect(() =>{
    if(window!==undefined){
      const database = JSON.parse(localStorage.getItem("database") ?? `{}`);
      setMetadata(database)

    }
  },[])

  return (
    <DatabaseContext.Provider value={{ databaseId, tableName, record, metadata, tables: tables?.data || [] }}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Hook untuk menggunakan context
export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
