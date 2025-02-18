import { AppSidebar } from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { fetchDatabases } from "@/service/api";


export default async function DatabaseLayout({
  children,
  params
}: Readonly<{
  params: { databaseId: string },
  children: React.ReactNode;
}>) {

  const {databaseId} = (await params)


  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
      <Header databaseId={databaseId}/>
        {/* <SidebarTrigger /> */}
        {children}
      </div>
    </SidebarProvider>
  );
}
