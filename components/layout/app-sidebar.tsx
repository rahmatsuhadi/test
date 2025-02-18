"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useTables } from "@/hooks/useTable";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { DatabaseSwitcher } from "./database-switcher";
import {
  ArrowBigLeftDash,
  AudioWaveform,
  ChevronRight,
  ChevronsUpDown,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Table,
} from "lucide-react";
import { navItems } from "@/constants/data";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Icons } from "../icons";

export function AppSidebar() {
  const params = useParams();
  const databaseId = params?.databaseId;
  const pathname = usePathname();

  const { data, isLoading } = useTables(databaseId as string);
  const router = useRouter();

  // useEffect(() => {
  //   if (!params?.table && data?.tables && data.tables.length > 0) {
  //     router.replace(
  //       "/databases/" + databaseId + "/tables/" + data.tables[0].name
  //     );
  //   }
  // }, [params?.table, data]);

  const [database,setDatabase] = useState<{name:string, type:string, id:string}>()


  useEffect(() =>{
    if(window!==undefined){
      const database = JSON.parse(localStorage.getItem("database") ?? `{}`);
      setDatabase(database)

    }
  },[])

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
            <span className="truncate font-semibold">{database?.name}</span>
            <span className="truncate text-xs">{database?.type}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          {/* <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu> */}

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={"Dashboard"}
                isActive={pathname === "/databases/" + databaseId}
              >
                <Link href={"/databases/" + databaseId}>
                  <LayoutDashboard/>
                  <span>{"Dashboard"}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {databaseId && (
            <SidebarMenu>
              <Collapsible
                key={"Tables"}
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={"Tables"}
                      isActive={pathname === "tables"}
                    >
                      <Table />
                      {/* {item.icon && <Icon />} */}
                      <span>{"Tables"}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {data?.data.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.name}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.name}
                          >
                            <Link
                              href={
                                "/databases/" + databaseId + "/" + subItem.name
                              }
                            >
                              <span>{subItem.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          )}
           {/* <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={"Dashboard"}
                isActive={pathname === "/databases/" + databaseId + "/relation"}
              >
                <Link href={"/databases/" + databaseId + "/relation"}>
                  <ArrowBigLeftDash/>
                  <span>{"Relation"}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu> */}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
