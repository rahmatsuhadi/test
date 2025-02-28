
import { SidebarProvider } from "@/components/ui/sidebar";
import { DatabaseProvider } from "@/context/DatabaseContext";

export default async function DatabaseLayout({
  children,
  params,
}: Readonly<{
  params: { databaseId: string };
  children: React.ReactNode;
}>) {
  const {  } = await params;

  return (
    <SidebarProvider>
      <DatabaseProvider>
          {children}
      </DatabaseProvider>
    </SidebarProvider>
  );
}
