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
import { BookA, FileDigit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Field, FieldType } from "@prisma/client";
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
import { useSearchParams } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
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
import { z } from "zod";
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

  const columnCustom = column
    ? column?.map((item): ColumnDef<Field[]> => {
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
    : [];
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
      <div className="w-full">
        <DataTable
          columns={[selectColumm, ...columnCustom, actionColumn]}
          data={data?.data ?? []}
        />
        <DrawerEditTableSchema />
      </div>
    </>
  );
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      isPrimary: z.boolean(),
      isRequired: z.boolean(),
    })
  ),
});

let TYPEDATA = [
  {
    label: "String",
    value: "STRING",
    icon: BookA,
  },
  {
    label: "Number",
    value: "INT",
    icon: FileDigit,
  },
];

const DrawerEditTableSchema = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { databaseId, tableName } = useDatabase();

  useEffect(() => {
    setIsOpen(Boolean(searchParams.get("edit")) || false);
  }, [searchParams.get("edit")]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fields: [{ name: "", type: "STRING", isPrimary: false, isRequired: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Field,
    Error,
    {
      databaseId: string;
      tableName: string;
      columns: Omit<Field, "id" | "createdAt" | "tableId">[];
    }
  >({
    mutationFn: ({ databaseId, columns, tableName }) =>
      createColumn(databaseId, tableName, columns),
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
      queryClient.refetchQueries({ queryKey: ["columns"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      // Invalidate queries atau refetch jika perlu
      // queryClient.invalidateQueries({ queryKey: ["tables"] }); // Ganti dengan nama query yang sesuai
    },
    onError: (error) => {
      console.log("Error creating table:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!databaseId || !tableName) return;
    await mutation.mutateAsync({
      databaseId: databaseId,
      columns: values.fields.map((ty) => {
        return { ...ty, type: ty.type as FieldType };
      }),
      tableName: tableName,
    });
  }

  const addField = () => {
    form.setValue("fields", [
      ...form.getValues("fields"),
      { name: "", type: "STRING", isPrimary: false, isRequired: true },
    ]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false} >
      <SheetContent className="" style={{maxWidth: "600px"}}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-1 mt-4"
          >
            <SheetHeader>
              <SheetTitle>Edit collection</SheetTitle>

             

            </SheetHeader>

            {/* form */}
            <FormField
                control={form.control}
                {...form.register(`name`)}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Collection Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div>
            <h2 className="">Fields</h2>
            {fields.map((_, index) => (
              <div key={_.id} className="space-y-3">
                <div className="flex space-x-2 my-1 ">
                  <FormField
                    control={form.control}
                    {...form.register(`fields.${index}.name`)}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input className="h-10" placeholder="Name" {...field} />

                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    {...form.register(`fields.${index}.type`)}
                    // name={`fields.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-[150px]">
                        <FormControl>
                          <Select 
                            {...field}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-10"  >
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Type Data</SelectLabel>
                                {TYPEDATA.map((type, i) => (
                                  <SelectItem key={i} value={type.value}>
                                    <Button 
                                      variant="link"
                                      className="w-full px-0"
                                    >
                                      <type.icon />
                                      {type.label}
                                    </Button>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant={"ghost"}
                    className="text-red-600"
                    size={"icon"}
                    type="button"
                    onClick={() => remove(index)}
                  >
                    <Trash />
                  </Button>
                </div>
                
              </div>
            ))}

              
            </div>

            <Button className="w-full" type="button" onClick={addField}>
                <Plus/> New Field
              </Button>

            {/* form */}
            <SheetFooter>
              <Button variant={"outline"} size={"lg"}>
                Cancel
              </Button>
              <Button size={"lg"}>Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
