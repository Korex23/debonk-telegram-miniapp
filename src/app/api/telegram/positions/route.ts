import { getActivePositions } from "@/BE/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const telegramId = req.nextUrl.searchParams.get("telegramId");
  if (!telegramId) {
    return NextResponse.json({ error: "telegramId required" }, { status: 400 });
  }

  const positions = await getActivePositions(telegramId);
  return NextResponse.json(positions);
}
