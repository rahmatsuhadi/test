"use client";

import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BinaryIcon,
  BookA,
  Calendar,
  Calendar1,
  FileDigit,
  Table2Icon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "FieldName must be at least 1 characters.",
  }),

  type: z.enum([
    "STRING",
    "NUMBER",
    "BOOLEAN",
    "DATE",
    "DATETIME",
    "RELATION_TABLE",
  ]),
  isPrimary: z.boolean().nullable(),
  isNull: z.boolean().nullable(),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
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
    label: "Boolean",
    value: "BOOLEAN",
    icon: BinaryIcon,
  },
  {
    label: "Date",
    value: "Datetime",
    icon: Calendar1,
  },
  {
    label: "Relation",
    value: "RELATION_TABLE",
    icon: Table2Icon,
  },
];

export function CreateTableDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "STRING",
      isPrimary: false,
      isNull: false,
      fields: [{ name: "", type: "STRING" }],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  // const addField = () => {
  //   form.setValue("fields", [
  //     ...form.getValues("fields"),
  //     { name: "", type: "STRING" },
  //   ]);
  // };

  return (
    <Dialog
      modal={true}
      open={isOpen}
      onOpenChange={setIsOpen}
      defaultOpen={isOpen}
    >
      <DialogTrigger>Create Table</DialogTrigger>
      <DialogContent className="max-h-[96%] p-4">
        <ScrollArea>
          <DialogHeader>
            <DialogTitle>Create new Table</DialogTitle>
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Name</FormLabel>
                    <FormControl>
                      <Input placeholder="name" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />


              {form.getValues("fields").map((_, index) => (
                <div key={index} className="space-y-2">
              <h2>Field Data First</h2>
                  <FormField
                    control={form.control}
                    name={`fields.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field</FormLabel>
                        <FormControl>
                          <Input placeholder="FieldName" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select {...field}>
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
                </div>
              ))}
              {/* <Button type="button" onClick={addField}>
                Add Field
              </Button> */}

              <Button type="submit">Submit</Button>
            </form>
          </Form>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
