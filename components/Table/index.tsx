"use client";
import { BookA, FileDigit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Field, FieldType } from "@prisma/client";
import { DataTable } from "@/app/databases/[databaseId]/[table]/data-table";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Input } from "../ui/input";
import { array, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColumn } from "@/service/api";
import { useDatabase } from "@/context/DatabaseContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ColumnManager from "./column";
import { useTable } from "@/context/TableContext";
import { DrawerEditTableSchema } from "./edit-schema";
import { useData } from "@/hooks/useTable";
import { DrawerNewTableSchema } from "./new-collection";
import { DrawerNewTableRecord } from "./create-record";

export interface RowData {
  [key: string]: unknown; // Dynamic properties
}

export default function TableContainer({
  db,
  table,
}: {
  table: string;
  db: string;
}) {

    const {tableName, columns} = useTable();
    
    
  const columnManager = new ColumnManager({ columns, tableName: table });

  const columnHeaders = [
    ...columnManager.generateSelectedColumn(),
    ...columnManager.generateCustomHeader(),
    // ...columnManager.actionColumn(),
  ];

  const columnsRow = columnManager.getAll()

  const {data} = useData(db, tableName)

  return (
    <>
      <div className="w-full">
        <DataTable columns={columnsRow} data={data?.data || []} />
        <DrawerEditTableSchema />
        <DrawerNewTableSchema />
        <DrawerNewTableRecord columns={columns}/>
      </div>
    </>
  );
}

