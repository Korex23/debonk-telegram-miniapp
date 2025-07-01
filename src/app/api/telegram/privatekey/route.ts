import { getPrivateKeyStingFromTelegramId } from "@/BE/lib/helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get("telegramId");

    if (!telegramId) {
      return NextResponse.json(
        { error: "Missing telegramId" },
        { status: 400 }
      );
    }

    const key = getPrivateKeyStingFromTelegramId(telegramId);
    return NextResponse.json({
      privateKey: key,
    });
  } catch (error) {
    console.error("[/api/telegram/private-key]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
