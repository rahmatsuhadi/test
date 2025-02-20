import PageContainer from "@/components/layout/page-containter";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CreateTableDialog } from "@/features/tables/components/create-table-dialog";
import TableListingPage from "@/features/tables/components/list";
import { Suspense } from "react";

export default async function DatabasesDashboard({
  params,
}: {
  params: Promise<{ databaseId: string }>;
}) {
  const { databaseId } = await params;

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-1 items-center justify-between">
          <Heading title="Tables" description="List Tables in Database " />
          <CreateTableDialog databaseId={databaseId}/>
        </div>
        <Separator />

        <Suspense fallback={<p>Loading</p>}>
          <TableListingPage databaseId={databaseId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
