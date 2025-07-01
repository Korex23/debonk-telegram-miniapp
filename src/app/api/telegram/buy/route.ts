import { buyToken } from "@/BE/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { telegramId, tokenAddress, amount } = await req.json();
  if (!telegramId || !tokenAddress || !amount) {
    return NextResponse.json(
      { error: "telegramId, tokenAddress, amount required" },
      { status: 400 }
    );
  }

  const result = await buyToken(telegramId, tokenAddress, amount);
  return NextResponse.json(result);
}
