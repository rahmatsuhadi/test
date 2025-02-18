"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDatabases } from "@/hooks/useDatabases";
import { useRouter } from "next/navigation";

export function SelectDatabase() {
  const { data } = useDatabases();

  const [selected, setSelected] = React.useState<string>();

  const router = useRouter();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Select Database</CardTitle>
        <CardDescription>Manage your Database in one-admin.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            {/* <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div> */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="databases">List Database</Label>
              <Select onValueChange={setSelected}>
                <SelectTrigger id="databases">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {data?.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* <Button variant="outline">Cancel</Button> */}
        <Button
          onClick={() => {
            localStorage.setItem(
              "database",
              JSON.stringify({
                databaseId: selected,
                name: data?.data.find((datab) => datab.id == selected)?.name,
                type: data?.data.find((datab) => datab.id == selected)?.type,
              })
            );

            router.push("/databases/" + selected);
          }}
          disabled={!!!selected}
          className="w-full"
        >
          Start
        </Button>
      </CardFooter>
    </Card>
  );
}
