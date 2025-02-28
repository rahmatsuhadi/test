import { useDatabase } from "@/context/DatabaseContext";
import {
  createColumn,
  createTable,
  IFormCreateTable,
  insertData,
} from "@/service/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldType, Table } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookA, Calendar1, FileDigit, Loader2, Plus, Trash } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
  FormDescription,
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
import { toast } from "sonner";
import { CustomError } from "@/types/type.error";

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
    value: "NUMBER",
    icon: FileDigit,
  },
  {
    label: "Date Time",
    value: "DATETIME",
    icon: Calendar1,
  },
];

type DynamicRecord = Record<string, any>;

export const DrawerNewTableRecord = ({ columns }: { columns: Field[] }) => {
  const searchParams = useSearchParams();

  const { databaseId, tableName } = useDatabase();

  const { setAction, action } = useTable();

  const form = useForm<DynamicRecord>({
    defaultValues: {
      // fields: [{ name: "_id", type: "STRING", isPrimary: true, isRequired: false }],
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const queryClient = useQueryClient();
  //   queryClient.refetchQueries({ queryKey: ["data"] });

  const mutation = useMutation<
    Table,
    Error,
    { databaseId: string; tableName: string; form: any }
  >({
    mutationFn: ({ databaseId, tableName, form }) =>
      insertData(databaseId, tableName, form),
    onSuccess: () => {
      //   queryClient.refetchQueries({ queryKey: ["data"] });
      setAction("record-add");
      form.reset();
      toast(`Record ${tableName} has been created.`);
      // Invalidate queries atau refetch jika perlu
      queryClient.invalidateQueries({ queryKey: ["data"] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        const customError = error as CustomError;

        if (customError.response?.data?.message) {
          toast(`Insert Record error: ${customError.response.data.message}`);
        } else {
          toast("Insert Record error: An unknown error occurred.");
        }
  
        console.log("Error creating table:", error);
      }
    },
  });

  function onSubmit(values: DynamicRecord) {
    const { _id, ...withoutId } = values;

    mutation.mutate({
      databaseId: databaseId,
      form: withoutId,
      tableName: tableName,
    });
  }

  const onClose = () => {
    form.reset();
    setAction("record-add");
  };

  return (
    <Sheet open={action == "record-add"} onOpenChange={onClose} modal={false}>
      <SheetContent className="" style={{ maxWidth: "600px" }}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-1 mt-4"
          >
            <SheetHeader>
              <SheetTitle>Create Record {tableName}</SheetTitle>
            </SheetHeader>

            <div>
              {columns.map((col, index) => {
                return (
                  <div key={col.id} className="space-y-3">
                    <Controller
                      control={control}
                      name={col.name}
                      defaultValue={col.type === "NUMBER" ? "0" : ""}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {col.name}
                            <span className="text-red-500">
                              {col.isRequired ? "*" : ""}
                            </span>{" "}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              required={col.isRequired}
                              disabled={index == 0}
                              type={
                                col.type == "NUMBER"
                                  ? "number"
                                  : col.type == "DATETIME"
                                  ? "date"
                                  : "text"
                              }
                              className="h-10"
                              placeholder={`${
                                index == 0 ? "auto()" : col.name
                              }`}
                            />
                            {/* {errors[col.name] && (
                            <p className="text-red-500">{errors[col.name]?.message}</p>
                            )} */}
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>

            {/* form */}
            <SheetFooter>
              <Button
                onClick={onClose}
                type="button"
                variant={"outline"}
                size={"lg"}
              >
                Cancel
              </Button>
              <Button size={"lg"}>{mutation.isPending ? <Loader2 className="animate-spin"/> : "Insert"}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
