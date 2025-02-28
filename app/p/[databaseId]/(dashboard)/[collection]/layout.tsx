
import Header from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { TableProvider } from "@/context/TableContext";

export default async function DatabaseLayout({
  children,
  params,
}: Readonly<{
  params: { databaseId: string; collection: string };
  children: React.ReactNode;
}>) {
  const { databaseId } = await params;


  return (
    <TableProvider>
      <AppSidebar />
      <div className="w-full">
        <Header databaseId={databaseId} />
        {children}
      </div>
    </TableProvider>
  );
}
