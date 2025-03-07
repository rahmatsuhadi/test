"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { DataTableColumnTable, } from "./table";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Field, Relation, Table } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader, Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useColumnByTableName } from "@/hooks/useColumn";
import { CreateColumnDialog } from "./create-column-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteColumnById } from "@/service/api";

type TableListingPage = { tableName: string , databaseId:string};

export const columns: ColumnDef<Field & { relationsA: Array<{ tableB: Table; fieldB: Field }> }>[] = [
  {
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const pathname = usePathname();
      return (
        <div className="">
          <Link href={ pathname + "/column/" + row.original.id} className="hover:underline">{row.getValue("name")}</Link>
        </div>
      );
    },
  },
  
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <div className="">
         {row.getValue("type")}
        </div>
      );
    },
  },
  
  {
    accessorKey: "isPrimary",
    header: "Primary",
    cell: ({ row }) => {
      return (
        <div className="">
         {row.original.isPrimary ? "YES" : "NO"}
        </div>
      );
    },
  },
  
  {
    accessorKey: "isRequired",
    header: "Required",
    cell: ({ row }) => {
      return (
        <div className="">
         {!row.original.isRequired ? "YES" : "NO"}
        </div>
      );
    },
  },
  {
    accessorKey: "relation",
    header: "Relation",
    cell: ({ row }) => {
      const field = row.original;
      const relation = row.original.relationsA
      return (
        <div className="" >
          {relation.map((rel, i) =>(<p key={i}>{rel.tableB.name}</p>))}
        </div>
      );
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <ActionsMenu column={row.original}/>
      );
    },
  },
];



function ActionsMenu({column}:{column:Field | {table:Table} & Field}){
  const queryClient = useQueryClient();

  const path = usePathname().split("/");
  const databaseId = path[2]
  const tableName = path[3]



  const {mutate} = useMutation<Field, Error, string>({
    mutationFn : () => deleteColumnById(databaseId, tableName, column.id),
    onSuccess:() =>{
      queryClient.refetchQueries({queryKey:["column"]})
    }
  })

  return(
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
           
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>View customer</DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => mutate(column.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}

export default function TableListingColumnPage({ tableName, databaseId }: TableListingPage) {
  //   const params = useParams<{ databaseId: string;}>();

  //   const {} = params

  const {data} = useColumnByTableName(databaseId,tableName)

  // const { data, isLoading } = useTables(columnId);




  return (
    <div>
      <DataTableColumnTable columns={columns} data={data?.data ?? []} />
    </div>
  );
}
