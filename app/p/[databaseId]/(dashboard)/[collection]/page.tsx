
import PageContainer from "@/components/layout/page-containter";
import TableContainer from "@/components/Table";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import ActionTableButton from "@/features/tables/components/action-button";
import { BookUser, Plus } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
  params: {
    databaseId: string;
    collection: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { collection, databaseId } = await params;

  return {
    title: `Aru | ${collection}`,
    description: `This is the dynamic page for ${databaseId}`,
  };
}

export default async function DatabaseDetail(request: {
  params: Promise<{ databaseId: string; collection: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { collection, databaseId } = await request.params;

  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-1 items-center justify-between">
          <Heading title={collection} description="List Record in Table " />

          <ActionTableButton/>
        </div>
        <Separator />

        <Suspense fallback={<p>Loading</p>}>
          <TableContainer db={databaseId} table={collection} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

