"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createColumn, createTable, IFormCreateTable } from "@/service/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldType, Table } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BinaryIcon,
  BookA,
  Calendar,
  Calendar1,
  FileDigit,
  Table2Icon,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  fields: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      isPrimary: z.boolean(),
      isNull: z.boolean(),
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
  // {
  //   label: "Boolean",
  //   value: "BOOLEAN",
  //   icon: BinaryIcon,
  // },
  // {
  //   label: "Date",
  //   value: "DATETIME",
  //   icon: Calendar1,
  // },
  // {
  //   label: "Relation",
  //   value: "RELATION_TABLE",
  //   icon: Table2Icon,
  // },
];

export function CreateColumnDialog({ tableName,databaseId }: {databaseId:string, tableName: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fields: [{ name: "", type: "STRING", isPrimary: false, isNull: false }],
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
    { databaseId: string; tableName: string, columns:Omit<Field, "id" | "createdAt" | "tableId">[]  }
  >({
    mutationFn: ({ databaseId, columns,tableName }) => createColumn(databaseId,tableName,columns),
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
  await  mutation.mutateAsync({
      databaseId:databaseId,
      columns: values.fields.map((ty) => {
        return { ...ty, type: ty.type as FieldType };
      }),
      tableName: tableName
    });
  }

  const addField = () => {
    form.setValue("fields", [
      ...form.getValues("fields"),
      { name: "", type: "STRING", isPrimary: false, isNull: false },
    ]);
  };

  return (
    <Dialog
      modal={true}
      open={isOpen}
      onOpenChange={setIsOpen}
      defaultOpen={isOpen}
    >
      <DialogTrigger asChild>
        <Button>Add Column</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[96%] p-4">
        <ScrollArea>
          <DialogHeader>
            <DialogTitle>Add new Column</DialogTitle>
            {/* <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription> */}
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 px-1 mt-4"
            >
              
              {fields.map((_, index) => (
                <div key={_.id} className="space-y-2">
                  <div className="flex space-x-2 ">
                    <FormField
                      control={form.control}
                      {...form.register(`fields.${index}.name`)}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Field</FormLabel>
                          <FormControl>
                            <Input placeholder="Field Name" {...field} />
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
                        <FormItem className="flex-1">
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select
                              {...field}
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
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
                      style={{ marginTop: 30 }}
                      className=""
                      size={"icon"}
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <Trash />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    {...form.register(`fields.${index}.isPrimary`)}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              // disabled={
                              //   !!form
                              //     .getValues("fields")
                              //     .find(
                              //       (f, i) => f.isPrimary && (`fields.${i}.isPrimary` != field.name)
                              //     )
                              // }
                              checked={field.value || false}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </FormControl>
                          <FormLabel>Primary</FormLabel>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    {...form.register(`fields.${index}.isNull`)}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel>isNull</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button type="button" onClick={addField}>
                Add Field
              </Button>

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
