import {
  getReferralDetails,
  requestReferralProfitWithdrawal,
} from "@/BE/lib/referrals/index";
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

    const details = await getReferralDetails(telegramId);

    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/referral]", error);
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telegramId } = await req.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: "Missing telegramId" },
        { status: 400 }
      );
    }

    const result = await requestReferralProfitWithdrawal(telegramId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[POST /api/telegram/referral]", error);
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
