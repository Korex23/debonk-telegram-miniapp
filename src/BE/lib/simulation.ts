import { getTokenDetails, getSolPrice } from "./helper";
import {
  prisma,
  getUserFromTelegramId,
  decrementUserSimulationBalance,
  incrementUserSimulationBalance,
  updatePositionOnBuySimulation,
  updatePositionOnSell,
  getBuyTransaction,
  calculateProfitLoss,
} from "./prisma";

export async function performSimulationBuy({
  telegramId,
  tokenAddress,
  amount,
}: {
  telegramId: string;
  tokenAddress: string;
  amount: number;
}) {
  const userBalance = await prisma.user.findUnique({
    where: { telegramId },
    select: { simulationBalance: true },
  });

  if (!userBalance || Number(userBalance.simulationBalance) < amount) {
    throw new Error("Insufficient Simulation SOL balance");
  }

  await decrementUserSimulationBalance(telegramId, amount);

  const user = await getUserFromTelegramId(telegramId);
  const tokenDetails = await getTokenDetails(tokenAddress);
  const amountInToken = amount / Number(tokenDetails.priceNative);

  const wallet = user?.wallet.find((w) => w.isPrimary);
  if (!wallet) {
    throw new Error("No primary wallet found.");
  }
  if (!user?.id) {
    throw new Error("User ID is undefined.");
  }

  await prisma.transaction.create({
    data: {
      amountBought: amountInToken.toString(),
      tokenAddress,
      status: "bought",
      buyHash: "simulation",
      tokenTicker: tokenDetails.name,
      walletId: wallet.id,
      userId: user.id,
      buyPrice: tokenDetails.priceUsd.toString(),
    },
  });

  await updatePositionOnBuySimulation(
    user?.id,
    wallet.id,
    tokenAddress,
    tokenDetails.name,
    amountInToken.toString(),
    tokenDetails.priceUsd.toString(),
    true
  );

  return { newBalance: Number(userBalance.simulationBalance) - amount };
}

export async function performSimulationSell({
  telegramId,
  tokenAddress,
  percentToSell,
}: {
  telegramId: string;
  tokenAddress: string;
  percentToSell: number;
}) {
  if (percentToSell < 1 || percentToSell > 100) {
    throw new Error("Percent to sell must be between 1 and 100.");
  }

  const user = await getUserFromTelegramId(telegramId);
  const position = user?.positions.find(
    (p) => p.isSimulation && p.tokenAddress === tokenAddress
  );

  if (!position) {
    throw new Error("No simulation position found for this token.");
  }

  const amountHeld = parseFloat(position.amountHeld);
  const amountToSell = amountHeld * (percentToSell / 100);

  const tokenDetails = await getTokenDetails(tokenAddress);
  const tokenSolPrice = Number(tokenDetails.priceNative);
  const amountInSol = tokenSolPrice * amountToSell;

  await incrementUserSimulationBalance(telegramId, amountInSol);

  const wallet = user?.wallet.find((w) => w.isPrimary);
  if (!wallet) {
    throw new Error("No primary wallet found.");
  }

  if (!user?.id) {
    throw new Error("User ID is undefined.");
  }
  const buyTransaction = await getBuyTransaction(
    user.id,
    wallet.id,
    tokenAddress
  );
  if (!buyTransaction) {
    throw new Error("No buy transaction found for this position.");
  }

  await prisma.transaction.update({
    where: { id: buyTransaction.id },
    data: {
      amountSold: amountToSell.toString(),
      status: "sold",
      sellHash: "simulation",
      sellPrice: tokenDetails.priceUsd.toString(),
    },
  });

  await updatePositionOnSell(
    user.id,
    wallet.id,
    tokenAddress,
    amountToSell.toString(),
    tokenDetails.priceUsd.toString()
  );

  return { creditedSol: amountInSol };
}

export async function getSimulationPositions(telegramId: string) {
  const user = await getUserFromTelegramId(telegramId);
  const positions = user?.positions?.filter((p) => p.isSimulation) ?? [];
  const wallet = user?.wallet.find((w) => w.isPrimary);
  if (!wallet) throw new Error("No primary wallet found.");

  const solPrice = await getSolPrice();

  const detailedPositions = await Promise.all(
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

  return detailedPositions;
}
