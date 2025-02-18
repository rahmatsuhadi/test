import TableContainer from "@/components/Table/table-container";
import PageContainer from "@/components/layout/page-containter";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function DatabaseDetail(request: {
  params: { databaseId: string; table: string },
  searchParams: SearchParams
}) {
  const {params} = (await request)

  const { table, databaseId } = await params;



  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-1 items-center justify-between">
          <Heading title={table} description="List Tables in Database " />
          {/* <Button>
            New Table <Plus />
          </Button> */}
        </div>
        <Separator />

       
        <Suspense fallback={<p>Loading</p>}>
          <TableContainer db={databaseId} table={table} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
