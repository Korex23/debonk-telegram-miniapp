import { deriveUserIndex } from "../utils";
import { APPLICATION_ERROR, LEAST_AMOUNT_REMAINDER } from "./constants/client";
import { BOT_USERNAME } from "./constants/server";
import {
  getTokenDetails_DEXSCREENER,
  getTokenDetails_DEXTOOLS,
} from "./dataService";
import { SLippageExceedingError } from "./errors";
import {
  calculateProfitLoss,
  getBuyTransaction,
  getUserFromTelegramId,
  prisma,
  updatePositionOnBuy,
  updatePositionOnSell,
} from "./prisma";
import {
  MasterSolSmartWalletClass,
  UserSolSmartWalletClass,
} from "./providers/server";
import {
  BuyTokenParams,
  PercentRange,
  SellTokenInSolParams,
  SellTokenParams,
  TokenDetails,
} from "./types";
// /pages/api/sell-token-sol.ts

import { Wallet } from "@prisma/client";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import numeral from "numeral";

export const getSolPrice = async (): Promise<number> => {
  const res = await UserSolSmartWalletClass.getSolPrice();
  return res.solUsdPrice;
};
export const getAddressFromTelegramId = (telegramId: string) => {
  console.log("telegramId: ", telegramId);
  const walletClass = new MasterSolSmartWalletClass();
  const index = deriveUserIndex(telegramId.toString());
  const address = walletClass.solAddressFromSeed(index);
  return address;
};

export const getPrivateKeyFromTelegramId = (telegramId: string): Keypair => {
  const walletClass = new MasterSolSmartWalletClass();
  const index = deriveUserIndex(telegramId.toString());
  const Keypair: Keypair = walletClass.solDeriveChildKeypair(index);
  return Keypair;
};

export const getPrivateKeyStingFromTelegramId = (
  telegramId: string
): string => {
  const walletClass = new MasterSolSmartWalletClass();
  const index = deriveUserIndex(telegramId.toString());
  const Keypair: Keypair = walletClass.solDeriveChildKeypair(index);

  const base58PrivateKey = bs58.encode(Keypair.secretKey);

  return base58PrivateKey;
};

export const getUserSolBalance = async (
  telegramId: string
): Promise<number> => {
  const userAddress = getAddressFromTelegramId(telegramId);
  const userBalance = await UserSolSmartWalletClass.getSolBalance(userAddress);
  return (userBalance ?? 0) / LAMPORTS_PER_SOL;
};

export const getUserTokenBalance = async (
  token: string,
  telegramId: string
) => {
  const key = getPrivateKeyFromTelegramId(telegramId);
  const userWalletClass = new UserSolSmartWalletClass(key);
  const balance = await userWalletClass.getTokenBalance(token);
  console.log("balance: ", balance);
  return balance;
};

export const getTokenDetails = async (token: string): Promise<TokenDetails> => {
  const isAddress = MasterSolSmartWalletClass.validateSolAddress(token);
  if (!isAddress) {
    if (!token || !(token.length === 44)) {
      throw new Error("invalid_address");
    }
  }

  let data: TokenDetails | null = null;
  try {
    data = await getTokenDetails_DEXSCREENER(token);
    console.log("data: ", data);
    if (!data) {
      data = await getTokenDetails_DEXTOOLS(token);
      if (data) {
        data.source = "PUMPFUN";
      }
      if (!data) {
        throw new Error("Could not fetch token details");
      }
    }
  } catch (error) {
    if (!data) {
      data = await getTokenDetails_DEXTOOLS(token);
      if (data) {
        data.source = "PUMPFUN";
      }
      if (!data) {
        throw new Error("Could not fetch token details");
      }
    }
  }

  return data as TokenDetails;
};

function formatPriceInSol(priceInSol: number): string {
  const priceStr = priceInSol.toFixed(10);
  const [integerPart, decimalPart] = priceStr.split(".");

  const leadingZerosMatch = decimalPart.match(/^0+/);
  const leadingZeros = leadingZerosMatch ? leadingZerosMatch[0] : "";
  const significantDigits = decimalPart.slice(leadingZeros.length);

  return `${integerPart}.___(${
    leadingZeros.length
  })___ ${significantDigits.substring(0, 2)}`;
}

export const getTokenDataForMiniApp = async (
  _token: string,
  telegramId: string,
  isSim = false
): Promise<any> => {
  try {
    const token = await getTokenDetails(_token);
    const user = await getUserFromTelegramId(telegramId);
    if (!user) {
      throw new Error("User not found");
    }
    const userBalance = isSim
      ? Number(user.simulationBalance)
      : await getUserSolBalance(telegramId);

    const userAddress = getAddressFromTelegramId(telegramId);
    const userKey = getPrivateKeyFromTelegramId(telegramId);
    const userClass = new UserSolSmartWalletClass(userKey);
    const { solUsdPrice } = await UserSolSmartWalletClass.getSolPrice();

    const position = user.positions.find(
      (p) => p.isSimulation === true && p.tokenAddress === _token
    );
    const wallet = user.wallet.find((w: Wallet) => w.isPrimary);

    const userTokenBalance = isSim
      ? Number(position?.amountHeld || 0)
      : await userClass.getTokenBalance(_token);

    const socials = {
      website: token.websiteUrl,
      twitter: token.twitterUrl,
      telegram: token.telegramUrl,
    };

    const result: any = {
      token: {
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        priceUsd: Number(token.priceUsd),
        priceSol: formatPriceInSol(Number(token.priceUsd)),
        volume: token.volume,
        change: token.change,
        liquidityUsd: token.liquidityInUsd,
        mc: token.mc,
        dexscreenerUrl: `https://dexscreener.com/solana/${token.address}`,
        socials,
      },
      user: {
        telegramId,
        address: userAddress,
        solBalance: userBalance,
        solBalanceUsd: userBalance * solUsdPrice,
        tokenBalance: userTokenBalance,
        tokenBalanceUsd: (userTokenBalance ?? 0) * Number(token.priceUsd),
        isSimulated: isSim,
      },
    };

    if (position && wallet) {
      const PNL_usd = await calculateProfitLoss(
        user.id,
        wallet.id,
        position.tokenAddress,
        token.priceUsd.toString()
      );
      const PNL_sol = PNL_usd / solUsdPrice;
      const capitalSol =
        (parseFloat(position.avgBuyPrice) * parseFloat(position.amountHeld)) /
        solUsdPrice;
      const currentTokenValueSol =
        parseFloat(position.amountHeld) * token.priceNative;
      const PNL_percent =
        (PNL_usd /
          (parseFloat(position.avgBuyPrice) *
            parseFloat(position.amountHeld))) *
        100;

      result.position = {
        capitalSol,
        capitalUsd:
          parseFloat(position.avgBuyPrice) * parseFloat(position.amountHeld),
        currentValueSol: currentTokenValueSol,
        currentValueUsd:
          parseFloat(position.amountHeld) *
          parseFloat(token.priceUsd.toString()),
        pnlSol: PNL_sol,
        pnlUsd: PNL_usd,
        pnlPercent: PNL_percent,
        pnlCardUrl: `https://t.me/${BOT_USERNAME}?start=pnlcard_${position.id}`,
      };
    }

    return result;
  } catch (error) {
    console.error("getTokenDataForMiniApp error:", error);
    throw error;
  }
};

const completeBuyAction = async (
  telegramId: string,
  tokenAddress: string,
  amount: number,
  solId: string
) => {
  const user = await getUserFromTelegramId(telegramId);
  const tokenDetails = await getTokenDetails(tokenAddress);

  const { tokenUsdPrice, tokenSolPrice } =
    await UserSolSmartWalletClass.getTokenPrice(tokenAddress);
  const amountInToken = Number(amount) / tokenSolPrice;
  console.log("amountInToken: ", amountInToken);
  const wallet = user?.wallet.filter((wallet: Wallet) => wallet.isPrimary)[0];

  if (!user?.wallet) {
    const address = getAddressFromTelegramId(telegramId.toString());
    console.log("address: ", address);

    if (user?.id !== undefined) {
      await prisma.wallet.upsert({
        where: { address: address },
        update: {},
        create: { userId: user.id, address: address, isPrimary: true },
      });
    } else {
      throw new Error("User ID is undefined when creating wallet.");
    }
  }

  if (!wallet?.id) {
    throw new Error("Wallet ID is undefined when creating transaction.");
  }

  await prisma.transaction.create({
    data: {
      amountBought: amountInToken.toString(),
      tokenAddress: tokenAddress,
      status: "bought",
      buyHash: solId,
      tokenTicker: tokenDetails.name,
      walletId: wallet.id,
      userId: user?.id,
      buyPrice: tokenDetails.priceUsd.toString(),
    },
  });

  if (!user || !wallet) {
    throw new Error("User or wallet not found during buy action.");
  }

  const res = await updatePositionOnBuy(
    user.id,
    wallet.id,
    tokenAddress,
    tokenDetails.name,
    amountInToken.toString(),
    tokenDetails.priceUsd.toString()
  );
  console.log("res: ", res);

  console.log("tokenAddress: ", tokenAddress);
};
export const doUserBuyToken = async (
  tokenAddress: string,
  amount: number,
  telegramId: string
): Promise<{ status: boolean; message?: string; result?: string }> => {
  const userKey = getPrivateKeyFromTelegramId(telegramId);
  const userClass = new UserSolSmartWalletClass(userKey);

  const params: BuyTokenParams = {
    amountInSol: amount,
    token: tokenAddress,
  };

  try {
    const tx = await userClass.buy(params);
    return {
      status: true,
      result: String(tx), // Ensure tx is returned as a string
    };
  } catch (error: any) {
    if (error instanceof SLippageExceedingError) {
      return {
        status: false,
        message: "Transaction failed due to slippage exceeding limit.",
      };
    }

    if (error.message === APPLICATION_ERROR.JUPITER_SWAP_ERROR) {
      return {
        status: false,
        message: "The token is not tradable.",
      };
    }

    console.error("doUserBuyTokenMiniApp error:", error);
    return {
      status: false,
      message: "Buy transaction failed unexpectedly.",
    };
  }
};

export const validateAmountGetTokenAndBuy = async (
  amount: number,
  telegramId: string,
  messageText: string
): Promise<{
  status: boolean;
  message: string;
  transactionLink?: string;
}> => {
  try {
    const userBalance = await getUserSolBalance(telegramId);

    if (userBalance < amount) {
      return {
        status: false,
        message: "Insufficient SOL balance. Please top up your wallet.",
      };
    }

    const leastToHave = Number(amount) + Number(LEAST_AMOUNT_REMAINDER);
    if (userBalance < leastToHave) {
      return {
        status: false,
        message: `Insufficient SOL balance for gas. You must have at least ${leastToHave} SOL.`,
      };
    }

    const tokenAddress = messageText;
    if (!tokenAddress) {
      return {
        status: false,
        message: "Token address not found in message.",
      };
    }

    const res = await doUserBuyToken(tokenAddress, amount, telegramId);

    if (!res.status) {
      return {
        status: false,
        message: "Buy transaction failed.",
      };
    }

    const solId = res.result as string;
    const solLink = `https://solscan.io/tx/${solId}`;

    await completeBuyAction(telegramId, tokenAddress, amount, solId);

    return {
      status: true,
      message: "Buy successful.",
      transactionLink: solLink,
    };
  } catch (error) {
    console.error("Error during buy transaction:", error);
    return {
      status: false,
      message: "An unexpected error occurred during the transaction.",
    };
  }
};

export const doUserSellTokenPercent = async (
  tokenAddress: string,
  percentToSell: PercentRange,
  userKey: string,
  slippage?: number
) => {
  // Convert userKey (string) to Keypair
  const keypair =
    typeof userKey === "string"
      ? getPrivateKeyFromTelegramId(userKey)
      : userKey;
  const userClass = new UserSolSmartWalletClass(keypair);

  const params: SellTokenParams = {
    token: tokenAddress,
    percentToSell,
    slippage,
  };

  console.log("Sell params (Mini App):", params);

  try {
    const result = await userClass.sell(params);
    return {
      status: "success",
      txHash: result?.result || null,
      message: "Token sold successfully",
    };
  } catch (error: any) {
    console.error("Sell error:", error);

    if (error instanceof SLippageExceedingError) {
      return {
        status: "error",
        code: "SLIPPAGE_EXCEEDED",
        message: "Slippage too high. Please adjust your tolerance.",
      };
    }

    return {
      status: "error",
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred during the sell transaction.",
    };
  }
};

export const doUserSellTokenSol = async (
  tokenAddress: string,
  amountToSellInSol: string,
  userKey: string,
  slippage?: number
) => {
  // Convert userKey (string) to Keypair if necessary
  const keypair =
    typeof userKey === "string"
      ? getPrivateKeyFromTelegramId(userKey)
      : userKey;
  const userClass = new UserSolSmartWalletClass(keypair);

  const params: SellTokenInSolParams = {
    token: tokenAddress,
    amountToSellInSol,
    slippage: 0.5,
  };

  console.log("Sell SOL-based token params (Mini App):", params);

  try {
    const result = await userClass.sell(params);
    return {
      status: "success",
      txHash: result?.result || null,
      message: "Token sold successfully.",
    };
  } catch (error: any) {
    console.error("Sell error:", error);

    if (error instanceof SLippageExceedingError) {
      return {
        status: "error",
        code: "SLIPPAGE_EXCEEDED",
        message: "Slippage too high. Please adjust your tolerance.",
      };
    }

    return {
      status: "error",
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred during the transaction.",
    };
  }
};

export const validateAmountGetTokenAndSell = async (
  telegramId: string,
  messageText: string,
  type: "PERCENT" | "AMOUNT",
  percentToSell?: PercentRange,
  amount?: number,
  slippage?: number
): Promise<{
  status: boolean;
  message: string;
  txHash?: string;
}> => {
  const tokenAddress: string | null = messageText;
  if (!tokenAddress) {
    return { status: false, message: "Invalid or missing token address." };
  }

  let txHash = "";
  let result: any;

  if (type === "PERCENT") {
    if (!percentToSell) {
      return { status: false, message: "Percentage to sell not provided." };
    }

    const sellResult = await doUserSellTokenPercent(
      tokenAddress,
      percentToSell,
      telegramId,
      slippage
    );

    result = sellResult;
    txHash = result.txHash;
  } else if (type === "AMOUNT") {
    if (amount === undefined) {
      return { status: false, message: "Amount to sell not provided." };
    }

    const sellResult = await doUserSellTokenSol(
      tokenAddress,
      amount.toString(),
      telegramId,
      slippage
    );

    result = sellResult;
    txHash = result.txHash;
  } else {
    return { status: false, message: "Invalid transaction type." };
  }

  if (result.status === false || !txHash) {
    return {
      status: false,
      message: `Sell transaction failed: ${result.message || "Unknown error"}`,
    };
  }

  const user = await getUserFromTelegramId(telegramId);
  const tokenDetails = await getTokenDetails(tokenAddress);

  if (!user) {
    return { status: false, message: "User not found." };
  }

  const wallet = user.wallet.find((w: Wallet) => w.isPrimary);
  const walletId =
    wallet?.id ??
    (
      await prisma.wallet.upsert({
        where: { address: getAddressFromTelegramId(telegramId) },
        update: {},
        create: {
          userId: user.id,
          address: getAddressFromTelegramId(telegramId),
          isPrimary: true,
        },
      })
    ).id;

  const buySol = await getBuyTransaction(user.id, walletId, tokenAddress);

  // Only update transaction as successful if txHash exists
  if (txHash) {
    await prisma.transaction.update({
      where: { id: buySol.id },
      data: {
        amountSold: (amount ?? 0).toString(),
        status: "sold",
        sellHash: JSON.stringify({
          txHash,
          status: "success",
          message: "Token sold successfully.",
        }),
        sellPrice: tokenDetails.priceUsd.toString(),
      },
    });

    await updatePositionOnSell(
      user.id,
      walletId,
      tokenAddress,
      (amount ?? 0).toString(),
      tokenDetails.priceUsd.toString()
    );
  }

  return {
    status: true,
    message: "Sell successful",
    txHash,
  };
};

export const sendUserWalletDetails = async (
  telegramId: string
): Promise<{
  address: string;
  solBalance: number;
  solUsdPrice: number;
  solBalanceInUsd: string;
  simulationBalance: number;
  simulationBalanceInUsd: string;
  explorerUrl: string;
}> => {
  const user = await getUserFromTelegramId(telegramId);
  const address = getAddressFromTelegramId(telegramId.toString());

  if (typeof user?.id !== "number") {
    throw new Error("User ID is undefined when creating wallet.");
  }

  // Ensure wallet is registered in DB
  await prisma.wallet.upsert({
    where: { address: address },
    update: {},
    create: { userId: user.id, address: address, isPrimary: true },
  });

  const solBalance = await getUserSolBalance(telegramId.toString());
  const { solUsdPrice } = await UserSolSmartWalletClass.getSolPrice();

  const simulationBalance = Number(user?.simulationBalance);
  const simulationBalanceInUsd = (simulationBalance * solUsdPrice).toFixed(2);
  const solBalanceInUsd = (solBalance * solUsdPrice).toFixed(2);

  return {
    address,
    solBalance,
    solUsdPrice,
    solBalanceInUsd,
    simulationBalance,
    simulationBalanceInUsd,
    explorerUrl: `https://solscan.io/account/${address}`,
  };
};

const formatCurrency = (number: number) => {
  try {
    const string = numeral(number).format("($0.00a)");
    return string;
  } catch (error) {
    console.log("error: ", error);
  }
};

const formatCurrencyWithoutDollarSign = (number: number) => {
  try {
    const string = numeral(number).format("(0.0a)");
    return string;
  } catch (error) {
    console.log("error: ", error);
  }
};
