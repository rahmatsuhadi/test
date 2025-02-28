"use client";
import React, { useState } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { DatabaseBackup, RefreshCw, Settings, Slash } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { migrateDatabaseById } from "@/service/api";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useTable } from "@/context/TableContext";
import { toast } from "sonner";

export default function Header({ databaseId }: { databaseId?: string }) {
  const pathname = usePathname();
  const path = pathname?.split("/") || [];

  const searchParams = useSearchParams();

  const [isEditConfig, setIsEditConfig] = useState<boolean>(
    !!searchParams.get("edit") || false
  );

  const [loadingMigrate, setLoadingMigrate] = useState<boolean>(false);
  const { setAction } = useTable();
  const [loadingRefetch, setLoadingRefetch] = useState<boolean>(false);

  const queryClient = new QueryClient();
  const refetchTable =  () => {
    setLoadingRefetch(true);
     queryClient.refetchQueries({ queryKey: ["data"] });
    setLoadingRefetch(false);
    // toast("Success")
  };

  const handleEditConfigDrawwer = () => {
    setAction("edit");
    setIsEditConfig(!isEditConfig);
  };

  const onClick = async () => {
    try {
      if (!databaseId) return;
      setLoadingMigrate(true);
      await migrateDatabaseById(databaseId);
      queryClient.refetchQueries({
        queryKey: ["tables", "columns", "data"],
      });

      toast("Database Success Migrated", {
        description: new Date().toLocaleDateString("en-EN", {
          day: "2-digit",
          weekday: "long",
          month: "short",
          year: "numeric",
          minute: "2-digit",
          hour: "2-digit",
        }),
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.log("LOG: ", error.message);
      }
    } finally {
      setLoadingMigrate(false);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/p">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/p/${databaseId}`}>
                {databaseId}
              </BreadcrumbLink>
            </BreadcrumbItem>

            {path.length > 3 && (
              <>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{path[3]}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleEditConfigDrawwer}
                  size={"icon"}
                  variant={"ghost"}
                >
                  <Settings />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Config Collection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size={"icon"}
                  type="button"
                  onClick={( ) =>refetchTable()}
                  className="rounded-full"
                  variant={"ghost"}
                >
                  <RefreshCw
                    className={`${loadingRefetch ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Table</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4">
        <div className="hidden md:flex">{/* <SearchInput /> */}</div>
        <Button type="button" onClick={onClick}>
          <DatabaseBackup
            className={`${loadingMigrate ? "animate-bounce" : ""}`}
          />
          {loadingMigrate ? "Migrating" : "Re-Migrate"}
        </Button>
      </div>
    </header>
  );
}
