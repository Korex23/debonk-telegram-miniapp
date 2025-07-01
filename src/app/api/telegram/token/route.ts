import { getTokenDetailsByAddress } from "@/BE/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const telegramId = req.nextUrl.searchParams.get("telegramId");
  const tokenAddress = req.nextUrl.searchParams.get("tokenAddress");
  if (!telegramId || !tokenAddress) {
    return NextResponse.json(
      { error: "telegramId and tokenAddress required" },
      { status: 400 }
    );
  }

  const result = await getTokenDetailsByAddress(tokenAddress, telegramId);
  return NextResponse.json(result);
}
