"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useTables } from "@/hooks/useTable";
import { useParams, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  ChevronsUpDown,
  DatabaseIcon,
  GalleryVerticalEnd,
  Plus,
} from "lucide-react";
import { useDatabase } from "@/context/DatabaseContext";
import { useTable } from "@/context/TableContext";

export function AppSidebar() {
  // const params = useParams();
//   const databaseId = params?.databaseId;
  // const pathname = usePathname();
  const {databaseId, tableName, metadata, tables} = useDatabase();


  const {setAction} = useTable()
  return (
    <Sidebar>
      <SidebarHeader>
        <Button
          variant={"link"}
          //   size="lg"
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-2"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {/* <activeDatabase.logo className="size-4" /> */}
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{metadata?.name}</span>
            <span className="truncate text-xs">{metadata?.type}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup>
          <SidebarGroupLabel>Collection Tables</SidebarGroupLabel>
          {tables.map(table => (
            <SidebarMenu key={table.id}>
            <SidebarMenuItem>
              <SidebarMenuButton
              size={"lg"}
                asChild
                tooltip={table.name}
                isActive={table.name == tableName}
              >
                <Link href={"/p/" + databaseId + "/" + table.name} className="py-2">
                  <DatabaseIcon />
                  <h3>{table.name}</h3>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          ))}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={"Dashboard"}
               
              >
                <Button type="button" onClick={()=> setAction("add", true)} size={"lg"} className=" py-5 font-semibold" variant={"outline"}>
                   <Plus/> Create new Collection
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
