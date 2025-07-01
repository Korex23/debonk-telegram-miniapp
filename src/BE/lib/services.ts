import {
  getAddressFromTelegramId,
  getUserSolBalance,
  getPrivateKeyFromTelegramId,
  getTokenDetails,
  getTokenDataForMiniApp,
  getSolPrice,
} from "./helper";
import {
  validateAmountGetTokenAndBuy,
  validateAmountGetTokenAndSell,
} from "./helper";
import { getUserFromTelegramId, calculateProfitLoss } from "./prisma";
import { UserSolSmartWalletClass } from "./providers/server";
import { PercentRange } from "./types";

// ----------------- WALLET SERVICES -----------------

export async function getWalletSummary(telegramId: string) {
  const address = getAddressFromTelegramId(telegramId);
  const user = await getUserFromTelegramId(telegramId);
  const balance = await getUserSolBalance(telegramId);
  const { solUsdPrice } = await UserSolSmartWalletClass.getSolPrice();

  return {
    address,
    balance,
    balanceUsd: balance * solUsdPrice,
    simulationBalance: user?.simulationBalance,
    simulationBalanceUsd: Number(user?.simulationBalance) * solUsdPrice,
  };
}

export async function withdrawSol(
  telegramId: string,
  amount: number,
  destination: string
) {
  const key = getPrivateKeyFromTelegramId(telegramId);
  const userWalletClass = new UserSolSmartWalletClass(key);
  const txId = await userWalletClass.withdrawSol(amount, destination);
  return { txId };
}

// ----------------- TRADE SERVICES -----------------

export async function buyToken(
  telegramId: string,
  tokenAddress: string,
  amount: number
) {
  return await validateAmountGetTokenAndBuy(amount, telegramId, tokenAddress);
}

export async function sellToken(
  telegramId: string,
  tokenAddress: string,
  amountOrType: "AMOUNT" | "PERCENT",
  percent?: PercentRange
) {
  return await validateAmountGetTokenAndSell(
    telegramId,
    tokenAddress,
    amountOrType,
    percent
  );
}

// ----------------- POSITION SERVICES -----------------

export async function getActivePositions(telegramId: string) {
  const user = await getUserFromTelegramId(telegramId);
  const positions = user?.positions?.filter((p) => !p.isSimulation) ?? [];
  const solPrice = await getSolPrice();

  return await Promise.all(
    positions.map(async (position) => {
      const tokenDetails = await getTokenDetails(position.tokenAddress);
      if (user?.id === undefined) {
        throw new Error("User ID is undefined.");
      }
      const pnlUsd = await calculateProfitLoss(
        user.id,
        position.walletId,
        position.tokenAddress,
        tokenDetails.priceUsd.toString()
      );
      const pnlSol = pnlUsd / solPrice;
      const pnlPercent =
        (pnlSol /
          (parseInt(position.amountHeld) * parseFloat(position.avgBuyPrice))) *
        solPrice *
        100;

      return {
        tokenAddress: position.tokenAddress,
        tokenTicker: position.tokenTicker,
        amountHeld: position.amountHeld,
        pnlUsd,
        pnlSol,
        pnlPercent,
        tokenDetails,
      };
    })
  );
}

// ----------------- TOKEN SERVICES -----------------

export async function getTokenDetailsByAddress(
  tokenAddress: string,
  telegramId: string
) {
  return await getTokenDataForMiniApp(tokenAddress, telegramId);
}
