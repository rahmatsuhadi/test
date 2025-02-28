"use client"
import { Button } from "@/components/ui/button";
import { useTable } from "@/context/TableContext";
import { BookUser, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ActionTableButton() {

  const {setAction} = useTable()

  return (
    <div className="flex gap-2 items-center">
      <Button variant={"outline"}>
        <BookUser /> Docs
      </Button>
      <Button type="button" onClick={() =>setAction("record-add")}>
        <Plus /> New Record
      </Button>
    </div>
  );
}
