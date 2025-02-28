import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schemaDatabase = z.object({
  name: z.string().min(5),
  type: z.enum(["mysql", "mongodb"]),
  host: z.string().min(5),
  username: z.string().min(5),
  password: z.string().min(5),
  port: z.number(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);

  const data = await prisma.relation.findMany({
    take: limit,
    skip: skip,
  });

  const count = await prisma.relation.count();

  return Response.json({
    data: data,
    limit,
    skip,
    total: count,
  });
}

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();

    const parsedData = schemaDatabase.parse(res);


    return Response.json({result:"OK"});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
