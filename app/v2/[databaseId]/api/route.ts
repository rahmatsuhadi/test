import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string }> }
) {
  // const searchParams = request.nextUrl.searchParams;
  // const limit = Number(searchParams.get("limit") || 20);
  // const skip = Number(searchParams.get("skip") || 0);
  const databaseId = (await params).databaseId;

  const database = await prisma.database.findFirst({
    where: {
      id: databaseId,
    },
  });
  if (!database) {
    return Response.json(
      {
        message: "Database Not Found",
      },
      { status: 404 }
    );
  }

  return Response.json({
    message: "Hello",
    metadata: {
      url: request.nextUrl + "/:table",
    },
  });
}
