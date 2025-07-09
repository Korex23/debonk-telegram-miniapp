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

  try {
    const result = await withdrawSol(telegramId, amount, destination);
    return NextResponse.json({ ...result, success: true });
  } catch (err) {
    console.error("❌ Withdrawal failed:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
