import { withdrawSol } from "@/BE/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { telegramId, amount, destination } = await req.json();
  if (!telegramId || !amount || !destination) {
    return NextResponse.json(
      { error: "telegramId, amount, destination required" },
      { status: 400 }
    );
  }

  const result = await withdrawSol(telegramId, amount, destination);
  return NextResponse.json(result);
}
