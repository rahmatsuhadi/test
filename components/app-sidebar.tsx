"use client"
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
  } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import Link from "next/link"
import { useTables } from "@/hooks/useTable"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
  
  export function AppSidebar() {

    const params = useParams();
    const databaseId = params?.db
    const {data} = useTables(databaseId as string)
    const router = useRouter()

    useEffect(() =>{
      if(!params?.table && data?.data && data.data.length>0){
        router.replace("/databases/" + databaseId +"/tables/" + data.data[0].name)
      }
    },[params?.table, databaseId, data?.data, router])


    return (
      <Sidebar>
        <SidebarHeader className="mt-10">
          <Link href={"/databases"}>
          Back
          </Link>
          <h1 className="text-center">Mangement Data ({"Dummy"})</h1>
        </SidebarHeader>
        <SidebarContent className="">
          <SidebarGroup>
            <SidebarGroupLabel>Database Detail</SidebarGroupLabel>
            {/* <SidebarGroupContent>
              <SidebarMenuItem className="font-bold">
                {data?.database?.host}
              </SidebarMenuItem>
              
              <SidebarMenuItem className="font-bold">
                {data?.database?.type}
              </SidebarMenuItem>
              <SidebarMenuItem className="font-bold">
                {data?.database?.port}
              </SidebarMenuItem>
              <SidebarMenuItem className="font-bold">
                {data?.database?.username}
              </SidebarMenuItem>
            </SidebarGroupContent> */}
          </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tables</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data && data.data?.map((item) => (
                <SidebarMenuItem key={item.name} className="">
                  <SidebarMenuButton asChild className="px-5" isActive={item.name == params?.table}>
                    <Button type="button" variant={"link"} onClick={() => router.replace("/databases/" + databaseId + "/tables/" + item.name)}>
                      {/* <item.icon /> */}
                      <span>{item.name}</span>

                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem >
                  <SidebarMenuButton asChild>
                    <Link href={"/databases/"}>
                    <Button className="btn w-full">Create New</Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  