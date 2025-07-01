import { getSimulationPositions } from "@/BE/lib/simulation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const telegramId = req.nextUrl.searchParams.get("telegramId");
    if (!telegramId) {
      return NextResponse.json(
        { error: "Missing telegramId" },
        { status: 400 }
      );
    }

    const positions = await getSimulationPositions(telegramId);

    return NextResponse.json({ success: true, positions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
