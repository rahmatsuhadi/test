import { useDatabase } from "@/context/DatabaseContext";
import { createColumn, deleteTableById } from "@/service/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldType, Table } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookA, FileDigit, Plus, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button } from "../ui/button";
import { useTable } from "@/context/TableContext";
import { useColumnByTableName } from "@/hooks/useColumn";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      isPrimary: z.boolean().nullable(),
      isRequired: z.boolean().nullable(),
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

export const DrawerEditTableSchema = () => {
  const { databaseId, tableName, tables } = useDatabase();

  const { setAction, action, columns } = useTable();
  // [{ name: "", type: "STRING", isPrimary: false, isRequired: false }]
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fields: [],
      name: tableName,
    },
  });

  useEffect(() => {
    form.setValue("fields", columns);
  }, [columns]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

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
      setAction("edit");
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

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate } = useMutation<Table, Error, string>({
    mutationFn: () => deleteTableById(databaseId, tableName),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["tables"] });
      setAction("edit");
      toast(`${tableName} has been deleted.`);
      router.replace("/p/" + databaseId + "/" + tables[0].name);
    },
    onError(error) {
      toast(`Create Table error`, { description: error.message });
    },
  });

  const handleDelete = (tableId: string) => {
    mutate(tableId);
  };

  return (
    <Sheet
      open={action == "edit"}
      onOpenChange={() => setAction("edit")}
      modal={false}
    >
      <SheetContent className="" style={{ maxWidth: "600px" }}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-1 mt-4"
          >
            <SheetHeader>
              <SheetTitle className="">
                Edit collection
                <Button
                  type="button"
                  onClick={() => handleDelete(tableName)}
                  className=""
                  size={"icon"}
                  variant={"ghost"}
                >
                  <Trash color="red" />
                </Button>
              </SheetTitle>
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
                            <Input
                              className="h-10"
                              placeholder="Name"
                              {...field}
                            />
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
                              disabled
                            >
                              <SelectTrigger className="h-10">
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
                    <Button
                      disabled
                      variant={"ghost"}
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

            <Button
              disabled
              className="w-full"
              type="button"
              onClick={addField}
            >
              <Plus /> New Field
            </Button>

            {/* form */}
            <SheetFooter>
              <Button variant={"outline"} size={"lg"}>
                Cancel
              </Button>
              <Button disabled size={"lg"}>
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
