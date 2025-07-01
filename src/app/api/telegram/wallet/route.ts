import { getWalletSummary } from "@/BE/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const telegramId = req.nextUrl.searchParams.get("telegramId");
  if (!telegramId) {
    return NextResponse.json({ error: "telegramId required" }, { status: 400 });
  }

  const data = await getWalletSummary(telegramId);
  return NextResponse.json(data);
}
