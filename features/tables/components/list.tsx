"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { DataTableTable } from "./table";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@prisma/client";
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
import { useTables } from "@/hooks/useTable";
import { migrateDatabase, migrateDatabaseById } from "@/service/api";
import { isAxiosError } from "axios";
import prisma from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

type TableListingPage = { databaseId: string };

export const columns: ColumnDef<Table>[] = [
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
          <Link href={ pathname + "/" + row.original.name + "/field"} className="hover:underline">{row.getValue("name")}</Link>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function TableListingPage({ databaseId }: TableListingPage) {
  //   const params = useParams<{ databaseId: string;}>();

  //   const {} = params

  const { data, isLoading } = useTables(databaseId);

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState<boolean>(false);

  const onClick = async () => {
    try {
      setLoading(true);
      await migrateDatabaseById(databaseId);
      queryClient.refetchQueries({
        queryKey: ["tables"],
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.log("LOG: ", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button className="" type="button" onClick={onClick}>
        Migrate
      </Button>
      {loading && <p>Proccessing Migration..............</p>}
      <DataTableTable columns={columns} data={data?.data ?? []} />
    </div>
  );
}
