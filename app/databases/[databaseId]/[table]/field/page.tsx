import PageContainer from "@/components/layout/page-containter";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import TableListingColumnPage from "@/features/column/components/list";
import { Plus } from "lucide-react";

export default async function ListColumn({
  params,
}: {
  params: Promise<{ databaseId: string, table:string }>;
}) {
  const { databaseId, table } = await params;

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-1 items-center justify-between">
          <Heading title={table} description="List Column in Table " />
          <Button>
            New Column <Plus />  
          </Button>
        </div>
        <Separator />

        <TableListingColumnPage databaseId={databaseId} tableName={table}/>

      </div>
    </PageContainer>
  );
}
