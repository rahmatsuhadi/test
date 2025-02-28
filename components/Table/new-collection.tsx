import { useDatabase } from "@/context/DatabaseContext";
import { createColumn, createTable, IFormCreateTable } from "@/service/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldType, Table } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookA,
  Calendar1,
  FileDigit,
  Loader2Icon,
  Plus,
  SettingsIcon,
  Table2,
  Trash,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      relationTable: z.string().nullable(),
      relationType: z.enum(["ONE_TO_ONE", "ONE_TO_MANY"]).nullable(),
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
  {
    label: "Relation Table",
    value: "RELATION",
    icon: Table2,
  },
];

let RELATION_TYPE = ["ONE_TO_ONE", "ONE_TO_MANY"];

export const DrawerNewTableSchema = () => {
  const searchParams = useSearchParams();

  const { databaseId, tableName } = useDatabase();

  const { setAction, action } = useTable();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fields: [],
      // fields: [{ name: "_id", type: "STRING", isPrimary: true, isRequired: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Table,
    Error,
    { databaseId: string; form: IFormCreateTable }
  >({
    mutationFn: ({ databaseId, form }) => createTable(databaseId, form),
    onSuccess: ({ name }) => {
      queryClient.refetchQueries({ queryKey: ["tables"] });
      setAction("add");
      form.reset();
      toast(`Collection ${name} has been created.`);
      // Invalidate queries atau refetch jika perlu
      // queryClient.invalidateQueries({ queryKey: ["tables"] }); // Ganti dengan nama query yang sesuai
    },
    onError: (error) => {
      toast(`Create Table error`, { description: error.message });
      console.log("Error creating table:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {

    mutation.mutate({
      databaseId: databaseId,
      form: {
        databaseId: databaseId,
        name: values.name,
        columns: values.fields.map((ty) => {
          return { ...ty, type: ty.type as FieldType };
        }),
      },
    });
  }

  const addField = () => {
    form.setValue("fields", [
      ...form.getValues("fields"),
      {
        name: "",
        type: "STRING",
        isPrimary: false,
        isRequired: false,
        relationTable: null,
        relationType: null,
      },
    ]);
  };

  useEffect(() => {
    if (form.getValues("fields").length == 0 && action == "add") {
      form.setValue("fields", [
        {
          name: "_id",
          type: "STRING",
          isPrimary: true,
          isRequired: true,
          relationTable: null,
          relationType: null,
        },
      ]);
    }
  }, [action]);

  const onClose = () => {
    form.reset();
    setAction("add");
  };

  const [keyCollapse, setyKeyCollapse] = useState<string | null>(null);

  const { tables } = useDatabase();

  return (
    <Sheet open={action == "add"} onOpenChange={onClose} modal={false}>
      <SheetContent className="" style={{ maxWidth: "600px" }}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-1 mt-4"
          >
            <SheetHeader>
              <SheetTitle>Create collection</SheetTitle>
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

              <ScrollArea className="h-[400px]">
                {fields.map((_, index) => (
                  <div
                    key={_.id}
                    className={`space-y-3 p-2 rounded-sm ${
                      keyCollapse == `fields.${index}.name`
                        ? " bg-slate-100 border-slate-200 border"
                        : ""
                    } `}
                  >
                    <Collapsible
                      open={keyCollapse == `fields.${index}.name`}
                      onOpenChange={() => {
                        if (
                          keyCollapse &&
                          keyCollapse == String(`fields.${index}.name`)
                        ) {
                          setyKeyCollapse(null);
                        } else {
                          setyKeyCollapse(String(`fields.${index}.name`));
                        }
                      }}
                      className="space-y-2"
                    >
                      <div className={`flex space-x-2 my-1`}>
                        <FormField
                          control={form.control}
                          {...form.register(`fields.${index}.name`)}
                          render={({ field }) => (
                            <FormItem className="flex-1 relative">
                              <FormControl>
                                <Input
                                  disabled={index == 0}
                                  className="h-10 bg-white"
                                  placeholder="Name"
                                  {...field}
                                />
                              </FormControl>

                              {index == 0 && (
                                <FormDescription className="text-slate-800">
                                  Field _id is required to create Collection
                                </FormDescription>
                              )}
                              {index != 0 &&
                                form.watch(`fields.${index}.isRequired`) && (
                                  <span className="absolute top-0 right-4 text-red-300 text-xs">
                                    *Required
                                  </span>
                                )}
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
                                  disabled={index == 0}
                                  {...field}
                                  value={field.value}
                                  onValueChange={field.onChange}
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
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" hidden={index == 0}>
                            <SettingsIcon />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="space-y-2">
                        <div className="flex gap-2">
                          {form.watch(`fields.${index}.type`) =="RELATION" && (
                            <>
                            <FormField
                            control={form.control}
                            {...form.register(`fields.${index}.relationTable`)}
                            // name={`fields.${index}.type`}
                            render={({ field }) => (
                              <FormItem className="w-[150px]">
                                <FormControl>
                                  <Select
                                    disabled={index == 0}
                                    {...field}
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Relation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectLabel>Tables</SelectLabel>
                                        {tables.map((tab, i) => (
                                          <SelectItem key={i} value={tab.id}>
                                            <Button
                                              variant="link"
                                              className="w-full px-0"
                                            >
                                              {tab.name}
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
                          <FormField
                            control={form.control}
                            {...form.register(`fields.${index}.relationType`)}
                            // name={`fields.${index}.type`}
                            render={({ field }) => (
                              <FormItem className="w-[150px]">
                                <FormControl>
                                  <Select
                                    disabled={index == 0}
                                    {...field}
                                    value={field.value ?? ""}
                                    defaultValue={RELATION_TYPE[0]}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectLabel>Realtion Type</SelectLabel>
                                        {RELATION_TYPE.map((rel, i) => (
                                          <SelectItem key={i} value={rel}>
                                            <Button
                                              variant="link"
                                              className="w-full px-0"
                                            >
                                              {rel}
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
                            </>
                          )}
                          <div className="flex items-center space-x-2">
                            <Switch
                              name={`fields.${index}.isRequired`}
                              disabled={index === 0}
                              onCheckedChange={(val) =>
                                form.setValue(`fields.${index}.isRequired`, val)
                              }
                              checked={form.watch(`fields.${index}.isRequired`)} // Menggunakan watch untuk mendapatkan nilai
                              id={`required-${index}`} // Menambahkan index untuk id yang unik
                            />{" "}
                            <Label htmlFor="required">Required</Label>
                          </div>
                          {/* <div className="flex items-center space-x-2">
                        <Switch id="primary" />
                        <Label htmlFor="primary">Primary</Label>
                      </div> */}
                          <Button
                            disabled={
                              index == 0 || form.getValues("fields").length == 0
                            }
                            variant={"ghost"}
                            className="text-red-600"
                            size={"icon"}
                            type="button"
                            onClick={() => remove(index)}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
                <ScrollBar draggable />
              </ScrollArea>
            </div>

            <Button className="w-full" type="button" onClick={addField}>
              <Plus /> New Field
            </Button>

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
              <Button size={"lg"}>
                {mutation.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
