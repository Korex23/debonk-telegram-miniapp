import { performSimulationSell } from "@/BE/lib/simulation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { telegramId, tokenAddress, percentToSell } = await req.json();

    if (!telegramId || !tokenAddress || !percentToSell) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await performSimulationSell({
      telegramId,
      tokenAddress,
      percentToSell,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
