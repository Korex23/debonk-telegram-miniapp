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

    // 1️⃣ Check if user already exists
    let user = await prisma.user.findUnique({
      where: { telegramId: telegramId.toString() },
    });

    if (!user) {
      // 2️⃣ User doesn't exist, create with referralCode
      user = await prisma.user.create({
        data: {
          telegramId: telegramId.toString(),
          referredBy: referralCode || 0,
        },
      });

      // Handle referrals (only on creation)
      if (referralCode) {
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
    }

    // 3️⃣ Ensure wallet exists for user
    const address = getAddressFromTelegramId(telegramId.toString());

    await prisma.wallet.upsert({
      where: { address },
      update: {},
      create: { userId: user.id, address, isPrimary: true },
    });

    // 4️⃣ Fetch balances
    const balance = await getUserSolBalance(telegramId.toString());
    const { solUsdPrice } = await UserSolSmartWalletClass.getSolPrice();

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
