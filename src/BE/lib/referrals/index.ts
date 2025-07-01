import { MIN_PROFIT_WITHDRAWAL_AMOUNT } from "../constants/client";
import { BOT_USERNAME, ADMIN_KEYBOARD_QUERY } from "../constants/server";
import { getAddressFromTelegramId, getSolPrice } from "../helper";
import {
  createReferralCashOut,
  getReferralProfit,
  getUserFromTelegramId,
} from "../prisma";

/**
 * Handle getting referral profit summary for a user
 */
export async function getReferralProfitsSummary(telegramId: string) {
  const user = await getUserFromTelegramId(telegramId);
  if (!user) {
    throw new Error("User not found");
  }

  const profit = (await getReferralProfit(telegramId)) ?? 0;
  const solPrice = await getSolPrice();
  const usdValue = profit * solPrice;

  return {
    telegramId,
    profit: profit.toFixed(6),
    usdValue: usdValue.toFixed(3),
    referralCountDirect: user.referralCountDirect,
    referralCountIndirect: user.referralCountIndirect,
  };
}

/**
 * Generate referral link message content
 */
export function getReferralLinkMessage(userId: number) {
  return {
    text: `💰Earn 50% fees through debonk’s multi-level referral system:
  
  - 35% for direct referrals,
  - 10% for second-generation referrals, &
  - 5% for third-generation referrals.
  
  Here is your referral link:
  https://t.me/${BOT_USERNAME}?start=ref_${userId}`,
    link: `https://t.me/${BOT_USERNAME}?start=ref_${userId}`,
  };
}

/**
 * Returns full referral details with link and profit
 */
export async function getReferralDetails(telegramId: string) {
  const user = await getUserFromTelegramId(telegramId);
  if (!user) {
    throw new Error("User not found. Please click /start.");
  }

  const linkMessage = getReferralLinkMessage(user.id);
  const profitSummary = await getReferralProfitsSummary(telegramId);

  return {
    userId: user.id,
    referralLink: linkMessage.link,
    referralMessage: linkMessage.text,
    profitSummary,
  };
}

/**
 * Handle withdrawing profits to user's wallet
 */
export async function requestReferralProfitWithdrawal(telegramId: string) {
  const profit = await getReferralProfit(telegramId);
  if (!profit || profit < MIN_PROFIT_WITHDRAWAL_AMOUNT) {
    throw new Error(
      `Insufficient referral profit to withdraw. Minimum required: ${MIN_PROFIT_WITHDRAWAL_AMOUNT}`
    );
  }

  const address = getAddressFromTelegramId(telegramId);

  const created = await createReferralCashOut(telegramId, address);
  if (!created) {
    throw new Error(
      "You already have a pending payout request. Please wait while we process it."
    );
  }

  const solPrice = await getSolPrice();
  const usdValue = profit * solPrice;

  // This would have gone to devBot.sendMessage. Instead, just return details for admin review.
  return {
    success: true,
    payoutRequest: {
      valueSol: profit.toFixed(6),
      valueUsd: usdValue.toFixed(2),
      payoutAddress: address,
      telegramId,
      adminUpdateCommand: ADMIN_KEYBOARD_QUERY.ADMIN_UPDATE_USER_PROFIT,
    },
  };
}
