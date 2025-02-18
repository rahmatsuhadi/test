import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schemaDatabase = z.object({
  name: z.string(),
  type: z.enum(["mysql", "mongodb"]),
  host: z.string(),
  username: z.string(),
  password: z.string(),
  port: z.number(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") || 20);
  const skip = Number(searchParams.get("skip") || 0);

  const data = await prisma.database.findMany({
    take: limit,
    skip: skip,
  });

  const count = await prisma.database.count();

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

    const result = await prisma.database.create({
        data: parsedData
    })

    return Response.json(result);
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
