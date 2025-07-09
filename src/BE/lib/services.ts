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

// In sellToken function, ensure slippage is passed through
export async function sellToken(
  telegramId: string,
  tokenAddress: string,
  amountOrType: "AMOUNT" | "PERCENT",
  percent?: PercentRange,
  amount?: number,
  slippage: number = 0.5 // Default slippage
) {
  return await validateAmountGetTokenAndSell(
    telegramId,
    tokenAddress,
    amountOrType,
    percent,
    amount,
    slippage
  );
}

// ----------------- POSITION SERVICES -----------------

export async function getActivePositions(telegramId: string) {
  const user = await getUserFromTelegramId(telegramId);
  const positions = user?.positions?.filter((p) => !p.isSimulation) ?? [];
  const wallet = user?.wallet.find((w) => w.isPrimary);
  const solPrice = await getSolPrice();

  if (!wallet) throw new Error("No primary wallet found.");

  return await Promise.all(
    positions.map(async (position) => {
      const tokenDetails = await getTokenDetails(position.tokenAddress);
      if (user?.id === undefined) {
        throw new Error("User ID is undefined.");
      }
      const PNL_usd = await calculateProfitLoss(
        user.id,
        wallet.id,
        position.tokenAddress,
        tokenDetails.priceUsd.toString()
      );
      const PNL_sol = PNL_usd / solPrice;
      const PNL_Sol_percent = (
        (PNL_sol /
          (parseFloat(position.amountHeld) *
            parseFloat(position.avgBuyPrice))) *
        solPrice *
        100
      ).toFixed(2);

      return {
        tokenAddress: position.tokenAddress,
        tokenTicker: position.tokenTicker,
        amountHeld: parseFloat(position.amountHeld),
        currentPriceUsd: tokenDetails.priceUsd,
        currentPriceSol: tokenDetails.priceNative,
        tokenMC: tokenDetails.mc,
        tokenSymbol: tokenDetails.symbol,
        tokenLiquidity: tokenDetails.liquidityInUsd,
        PNL_usd,
        PNL_sol,
        PNL_Sol_percent: Number(PNL_Sol_percent),
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
