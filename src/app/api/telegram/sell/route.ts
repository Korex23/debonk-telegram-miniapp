import { sellToken } from "@/BE/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { telegramId, tokenAddress, amount, percent, amountOrType } =
    await req.json();
  if (!telegramId || !tokenAddress || (!amount && !percent)) {
    return NextResponse.json(
      { error: "telegramId, tokenAddress, and amount or percent required" },
      { status: 400 }
    );
  }

  const result = await sellToken(
    telegramId,
    tokenAddress,
    amountOrType,
    percent,
    amount
  );
  return NextResponse.json(result);
}
