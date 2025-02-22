"use client";

import { useData } from "@/hooks/useTable";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Field } from "@prisma/client";
import {
  EditableCell,
  HeaderAddColumn,
  HeaderColumn,
} from "@/app/databases/[databaseId]/[table]/column";
import { DataTable } from "@/app/databases/[databaseId]/[table]/data-table";
import { useColumnData } from "@/hooks/useColumn";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";

export  interface RowData {
  [key: string]: unknown; // Dynamic properties
}

export default function TableContainer({
  db,
  table,
}: {
  table: string;
  db: string;
}) {
  const { data: column } = useColumnData(db, table);
  const { data } = useData(db, table);

  // const defaultColumn: ColumnDef<any>[] = [
  //   {
  //     id: "select",
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //   },
  // ];

  const columnCustom =
  column
    ? column.data?.map((item): ColumnDef<Field[]> => {
        return {
          accessorKey: item.name,
          header: ({ column }) => {
            return <HeaderColumn column={column} title={item.name} />;
          },
          cell: ({ cell }) => {
            return <EditableCell cell={cell} updateMyData={() => {}} />;
          },
        };
      })
    : []
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const selectColumm: ColumnDef<any> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  };
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const actionColumn: ColumnDef<any> = {
    id: "actions",
    header() {
      return <HeaderAddColumn />;
    },
    cell: ({  }) => {

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  const listrequest = [
    {
      method: "GET",
    },
    {
      method: "GET",
      params: ":id",
    },
    {
      method: "POST",
    },
    {
      method: "DELETE",
      params: ":id",
    },
  ];

  const [hostname, setHostname] = useState<string>("");

  useEffect(() => {
    // Mendapatkan hostname saat komponen di-mount
    const protocol = window.location.protocol;
    setHostname(protocol + "//" + window.location.host);
  }, []); // Array kosong berarti efek hanya dijalankan sekali saat komponen di-mount
  return (
    <>
      {listrequest.map((item, i) => {
        const url = `${hostname}/v2/${db}/api/${table}${
          item.params ? "/" + item.params : ""
        }`;
        return (
          <div key={i} className="flex flex-col">
            <Label className="font-bold mb-2">{item.method}</Label>
            <div className="flex items-center space-x-2">
              <h4 className="flex  min-w-[50%] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                {url}
              </h4>
             {/* <CreateColumnDialog databaseId={db} tableName={table} /> */}
            </div>
          </div>
        );
      })}
      
      <Separator />

      <div className="w-full">
        <DataTable
          columns={[selectColumm, ...columnCustom, actionColumn]}
          data={data?.data ?? []}
        />
      </div>
    </>
  );
}
