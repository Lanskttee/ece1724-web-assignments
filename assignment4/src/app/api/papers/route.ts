import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Paper } from "@prisma/client";

export async function GET(): Promise<NextResponse<Paper[]>> {
  // TODO: Fetch all papers with authors, sorted by id ascending
  // TODO: Return as JSON response
  try {
    const papers = await prisma.paper.findMany({
      include: { authors: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(papers);
  } catch (error) {
    // return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 }) as NextResponse<any>;
    // return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 });
    return NextResponse.json([] as Paper[], { status: 500 });
}
}
