"use client";

import { useParams} from "next/navigation";
import { DataDatabaseTable } from "./table";
  
type DatabaseListingPage = {};

export default function DatabaseListingPage({}: DatabaseListingPage) {
  const params = useParams<{ tag: string; item: string }>();


  return(
    <DataDatabaseTable/>
  )
}
