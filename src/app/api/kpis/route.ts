import { NextRequest, NextResponse } from "next/server";
import { listKpis } from "@/lib/data-access";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const data = await listKpis({ q: sp.get("q") ?? undefined });
  return NextResponse.json({ data, meta: { count: data.length } });
}
