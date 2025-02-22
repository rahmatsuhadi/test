import PageContainer from "@/components/layout/page-containter";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CreateColumnDialog } from "@/features/column/components/create-column-dialog";
import TableListingColumnPage from "@/features/column/components/list";

export default async function ListColumn({
  params,
}: {
  params: Promise<{ databaseId: string; table: string }>;
}) {
  const { databaseId, table } = await params;

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-1 items-center justify-between">
          <Heading title={table} description="List Column in Table " />

          <CreateColumnDialog databaseId={databaseId} tableName={table} />
        </div>
        <Separator />

        <TableListingColumnPage databaseId={databaseId} tableName={table} />
      </div>
    </PageContainer>
  );
}
