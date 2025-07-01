import { getAddressFromTelegramId, getUserSolBalance } from "@/BE/lib/helper";
import {
  getUserById,
  incrementReferralCountDirect,
  incrementReferralCountIndirect,
  prisma,
} from "@/BE/lib/prisma";
import { UserSolSmartWalletClass } from "@/BE/lib/providers/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { telegramId, referralCode } = await req.json();
    if (!telegramId) {
      return NextResponse.json(
        { error: "Missing telegramId" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { telegramId: telegramId.toString() },
      update: { referredBy: referralCode || 0 },
      create: { telegramId: telegramId.toString() },
    });

    const address = getAddressFromTelegramId(telegramId.toString());

    await prisma.wallet.upsert({
      where: { address },
      update: {},
      create: { userId: user.id, address, isPrimary: true },
    });

    const balance = await getUserSolBalance(telegramId.toString());
    const { solUsdPrice } = await UserSolSmartWalletClass.getSolPrice();

    // Handle referrals (if any)
    if (referralCode && user.referredBy === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { referredBy: referralCode },
      });

      await incrementReferralCountDirect(referralCode);
      const level1 = await getUserById(referralCode);
      if (level1) {
        await incrementReferralCountIndirect(level1.referredBy);
        const level2 = await getUserById(level1.referredBy);
        if (level2) {
          await incrementReferralCountIndirect(level2.referredBy);
        }
      }
    }

    return NextResponse.json({
      address,
      balance,
      solUsdBalance: (balance * solUsdPrice).toFixed(2),
      simulationBalance: user.simulationBalance,
      simulationUsd: (Number(user.simulationBalance) * solUsdPrice).toFixed(2),
      solUsdPrice,
      explorerUrl: `https://solscan.io/account/${address}`,
    });
  } catch (error) {
    console.error("Error in /api/start-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
