
import { Metadata } from "next";
import { redirect } from "next/navigation";


interface PageProps {
    params: {
    databaseId: string;
      collection: string;
    };
  }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { collection,databaseId} = await params;
  
    return {
      title: `${collection}`,
      description: `This is the dynamic page for ${databaseId}`,
    };
  }
  

export default async function DatabaseDetail(request: {
  params: Promise<{databaseId: string; table: string}>
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

  const {databaseId } = (await request.params);


  redirect("/p/" + databaseId + "/overview")

}
