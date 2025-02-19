import TableContainer from "@/components/Table/table-container";
import PageContainer from "@/components/layout/page-containter";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

export default async function DatabaseDetail(request: {
  params: Promise<{databaseId: string; table: string}>
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

  const { table, databaseId } = (await request.params);

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
