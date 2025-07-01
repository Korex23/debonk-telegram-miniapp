import { EVM_CHAIN_MAP, NETWORK_MAP, TOKEN_MAP } from "./lib/constants/client";
import { YOU_ARE_IN_THE_SIMULATION_TEXT } from "./lib/constants/client";
import { Validator } from "./lib/constants/server";
import { validateSolAddress } from "./lib/providers/client";
import { PublicKey } from "@solana/web3.js";
import { createHash } from "crypto";
import numeral from "numeral";

// Utilities
function hashUserId(userId: string): string {
  return createHash("sha256").update(userId.toString()).digest("hex");
}

function hexToInt(hexString: string): bigint {
  return BigInt("0x" + hexString);
}

function reduceToIndexRange(largeInt: bigint, modulo: bigint): number {
  return Number(largeInt % modulo);
}

const MAX_INDEX = BigInt(2 ** 31);

export function deriveUserIndex(userId: string): number {
  const hashedId = hashUserId(userId);
  const largeInt = hexToInt(hashedId);
  return reduceToIndexRange(largeInt, MAX_INDEX);
}

export function convertToTowDeciamalPlace(value: number): number {
  return Number(value.toFixed(2));
}

export const solAddressValidator: Validator<string> = async (value: string) => {
  let status = false;
  const xValue = getContractAddressFromTextOrLink(value);
  try {
    new PublicKey(xValue ?? "");
    status = true;
  } catch (error) {
    if (xValue?.length === 44) {
      status = true;
    }
  }
  return status;
};

export interface NumberValidator extends Validator<number> {}

export const numberValidator: NumberValidator = async (
  value: number
): Promise<boolean> => {
  const amount: number = Number(value.toString());
  return !!amount;
};

export const stringValidator: Validator<string> = async () => true;

export const numberValidatorOptionalNone: Validator<number> = async (
  value: number
) => {
  const amount = parseInt(value.toString());
  return amount === 0 || !!amount;
};

export function createProgressBar(
  percentage: number,
  barLength: number = 10
): string {
  const filledLength = Math.round((percentage / 100) * barLength);
  const emptyLength = barLength - filledLength;
  return `${percentage}%: ${"█".repeat(filledLength)}${"░".repeat(
    emptyLength
  )}`;
}

export const getPageNumberFromText = (messageText: string): number | null => {
  const pageMatch = messageText.match(/Page: ([0-9]+)/);
  return pageMatch?.[1] ? parseInt(pageMatch[1]) : null;
};

export const getTokenDetails = async (token: string): Promise<any> => {
  const isAddress = validateSolAddress(token);
  if (!isAddress) throw new Error("Invalid address");

  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/pairs/solana/${token}`
  );
  const data = await res.json();

  return data.msg === "SUCCESS" ? data.data : null;
};

export const getTrxPrice = async (): Promise<number> => {
  const res = await fetch(
    "https://apilist.tronscanapi.com/api/token/price?token=trx",
    {
      headers: {
        accept: "application/json",
        secret:
          "OTljMjUxZGEzOGI5OTcyMDc4ZjlmZGRiNTBjZDg2NmIwMDIwYzgyNTI5ZmY0YzBmNGM3YWQzZjJmNGFhNGJiZA==",
        Referer: "https://tronscan.org/",
      },
    }
  );
  const data = await res.json();
  return data.price_in_usd;
};

export const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const formatCurrencyWithoutDollarSign = (number: number) =>
  numeral(number).format("(0.00 a)");

export const formatCurrency = (number: number) =>
  numeral(number).format("($0.00a)");

export const getGreenCircleByNumber = (number: number) =>
  `🟩 `.repeat(number + 1);

export const getGreenCircleByTrxBought = (trxBought: number) =>
  getGreenCircleByNumber(Math.floor(trxBought / 100));

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

export function calculatePercentageChange(
  oldPrice: number,
  currentPrice: number
): number {
  const percentChange = ((currentPrice - oldPrice) / oldPrice) * 100;
  return percentChange === Infinity ? 0 : Number(percentChange.toFixed(2));
}

export function getCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}

export const getTelegramIdFromText = (messageText: string): number | null => {
  const match = messageText.match(/TelegramId: ([0-9]+)/);
  return match?.[1] ? parseInt(match[1]) : null;
};

export const formatter = ({
  decimal = 2,
  style = "decimal",
  currency = undefined,
}: {
  decimal?: number;
  style?: string;
  currency?: string;
}) => {
  return new Intl.NumberFormat(undefined, {
    style: style as any,
    currency,
    maximumFractionDigits: decimal,
    minimumFractionDigits: decimal,
    useGrouping: true,
  });
};

export const checkIfMessageIsSimulation = (messageText: string): boolean => {
  return messageText.includes(YOU_ARE_IN_THE_SIMULATION_TEXT);
};

export function getContractAddressFromTextOrLink(input: string) {
  const contractAddressRegex = /^[A-Za-z0-9]{43,}$/;
  const linkRegex = /\/([A-Za-z0-9]{43,})/;

  if (contractAddressRegex.test(input)) return input;

  const match = input.match(linkRegex);
  return match ? match[1] : null;
}

export const standardizeNetwork = (network: string): string => {
  const standardized = NETWORK_MAP[network.toLowerCase().replace(/\s+/g, "")];
  return standardized ?? network.toUpperCase();
};

export const standardizeToken = (token: string): string => {
  const standardized = TOKEN_MAP[token.toLowerCase().replace(/\s+/g, "")];
  return standardized ?? token.toUpperCase();
};

export const standardizeAddressNetwork = (network: string): string => {
  const standardized = EVM_CHAIN_MAP[network.toLowerCase().replace(/\s+/g, "")];
  return standardized ?? network.toLowerCase();
};
