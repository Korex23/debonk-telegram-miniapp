import { performSimulationBuy } from "@/BE/lib/simulation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { telegramId, tokenAddress, amount } = await req.json();

    if (!telegramId || !tokenAddress || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await performSimulationBuy({
      telegramId,
      tokenAddress,
      amount,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
