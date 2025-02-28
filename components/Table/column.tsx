import { Field } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import React, { Component } from "react";
import { EditableCell, HeaderAddColumn, HeaderColumn } from "./module";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";

interface State {
  columns: Field[];
  tableName: string;
}

class ColumnManager {
  private columns: Field[];

  constructor({ columns, tableName }: State) {
    this.columns = columns;
  }

  getAll(){

   return this.generateSelectedColumn().concat(this.generateCustomHeader()).concat(this.actionColumn())
  }

  generateCustomHeader() {
    return this.columns.map((item): ColumnDef<Field[]> => {
      return {
        accessorKey: item.name,
        header: ({ column }) => {
          return <HeaderColumn column={column} title={item.name} />;
        },
        cell: ({ cell }) => {
          return <EditableCell cell={cell} updateMyData={() => {}} />;
        },
      };
    });
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  generateSelectedColumn(): ColumnDef<any>[] {
    return [{
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
      }];
  }

  actionColumn(): ColumnDef<any>[] {
    return [{
        id: "actions",
        header() {
          return <HeaderAddColumn />;
        },
        cell: ({}) => {
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
      }];
  }
}

export default ColumnManager;
