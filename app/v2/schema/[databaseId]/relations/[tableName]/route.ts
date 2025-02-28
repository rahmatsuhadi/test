import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string; tableName: string }> }
) {

const databaseId = (await params).databaseId
const tableName = (await params).tableName
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);

  const data = await prisma.relation.findMany({
    where:{table:{name: tableName, databaseId: databaseId}},
    select:{type: true,relationTable: {select: {name: true, id:true}}},
    take: limit,
    skip: skip,
  });

  return Response.json(data);
}
