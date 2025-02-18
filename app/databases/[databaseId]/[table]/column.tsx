"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Cell, CellContext, ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import React, { useEffect, useState } from "react";
import { Field } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const formSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.string(),
  required: z.boolean(),
});

export const HeaderColumn = ({
  title,
  column,
}: {
  title: string;
  column: ColumnDef<Field>;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Dialog>
      <DialogTrigger>{title}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FieldName</FormLabel>
                    <FormControl>
                      <Input placeholder="name" {...field} />
                    </FormControl>
                    <FormDescription>This is your filed name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export const HeaderAddColumn = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      required: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Dialog>
      <DialogTrigger type="button" className="">
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormLabel>Required</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select  {...field} >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {/* <SelectLabel></SelectLabel> */}
                            <SelectItem value="int">Int</SelectItem>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="relation">Relation Table</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export interface EditableCellProps {
  cell: Cell<any, unknown>;
  updateMyData: (rowIndex: number, columnId: string, value: string) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  cell,
  updateMyData,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const initialValue = cell.getValue<string>() ?? "";
  const [value, setValue] = useState<string>(initialValue);

  // Update state jika cell berubah
  useEffect(() => {
    setValue(cell.getValue<string>() ?? "");
  }, [cell]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    updateMyData(cell.row.index, cell.column.id, value);
    setIsEditing(false);
  };

  return isEditing ? (
    <input
      type="text"
      value={value}
      className="w-auto"
      onChange={handleChange}
      style={{
        width: "auto",
        minWidth: "50px", // Ukuran minimum
        padding: "4px", // Padding untuk tampilan yang lebih baik
      }}
      onBlur={handleBlur}
    />
  ) : (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: "pointer",
        // minWidth: '50px', // Ukuran minimum agar tetap bisa diklik
        // minHeight: '30px', // Atau set ukuran minimum tinggi
        // display: 'flex',
        // alignItems: 'center', // Memastikan teks di tengah
        // justifyContent: 'center', // Memastikan teks di tengah
      }}
    >
      {value !== "" ? value : "-"}
    </div>
  );
};
