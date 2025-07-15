"use client";

import { useUserData } from "../context/user-provider";
import error from "@/assets/error.json";
import success from "@/assets/success.json";
import Lottie from "lottie-react";
import { Link, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface TokenPosition {
  tokenAddress: string;
  tokenTicker: string;
  amountHeld: number;
  amountHeldSol: number;
  currentPriceUsd: number;
  currentPriceSol: number;
  tokenMC?: number | undefined;
  tokenSymbol: string;
  tokenLiquidity: number;
  PNL_usd: number;
  PNL_sol: number;
  PNL_Sol_percent: number;
  token5MChange: number | string;
  tokenh1Change: number | string;
  tokenh24Change: number | string;
  twitterUrl: string;
  telegramUrl: string;
  websiteUrl: string;
  volume24h: number;
}

interface Props {
  data: TokenPosition;
  onClose: () => void;
  telegramId: string;
  solBalance: number;
}

const PositionModal: React.FC<Props> = ({
  data,
  onClose,
  telegramId,
  solBalance,
}) => {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  });
  const pathname = usePathname();
  const router = useRouter();
  const [txHash, setTxHash] = useState("");
  const [sellTxHash, setSellTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [err, setErr] = useState("");
  const [failed, setFailed] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const { isSimulation } = useUserData();

  const isNavigating = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let autoCloseTimer: NodeJS.Timeout;

    if (successful) {
      if (pathname === "/") {
        autoCloseTimer = setTimeout(() => {
          setSuccessful(false);
        }, 5000);
      } else {
        timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      }
    }

    if (
      successful &&
      countdown === 0 &&
      pathname !== "/" &&
      !isNavigating.current
    ) {
      isNavigating.current = true;
      router.push("/");
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [successful, countdown, pathname]);

  const handleBuy = async (amount: number) => {
    if (!amount) return;
    if (!telegramId) return;

    try {
      setLoading(true);
      const res = await fetch("/api/telegram/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: `${telegramId}`,
          tokenAddress: data.tokenAddress,
          amount,
        }),
      });

      const result = await res.json();
      console.log("Buy Result:", result);
      setTxHash(result.transactionLink);
      setBuySuccess(true);
    } catch (error) {
      console.error("Buy error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellRealPositions = async (percent: number) => {
    try {
      setSellLoading(true);
      const res = await fetch("/api/telegram/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: `${telegramId}`,
          tokenAddress: data.tokenAddress,
          amountOrType: "PERCENT",
          percent: percent,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const result = await res.json();
      console.log("Sell result:", result);
      // alert(JSON.stringify(result, null, 2));

      if (result.status === true && result.txHash) {
        // alert("Transaction passed");
        setSellTxHash(result.txHash);
        setSuccessful(true);
      } else {
        // alert("Transaction failed");
        setFailed(true);
        setErr(result.message || "Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error selling position:", error);
      // alert("Catch block: " + error.message);
      setFailed(true);
      setErr(error.message || "An unexpected error occurred.");
    } finally {
      setSellLoading(false);
    }
  };

  const handleSimBuy = async (amount: number) => {
    if (!amount) return;
    if (!telegramId) return;

    try {
      setLoading(true);
      const res = await fetch("/api/telegram/simulation/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: `${telegramId}`,
          tokenAddress: data.tokenAddress,
          amount,
        }),
      });

      const result = await res.json();
      console.log("Buy Result:", result);
      setBuySuccess(true);
    } catch (error) {
      console.error("Buy error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellSimPositions = async (percent: number) => {
    try {
      setSellLoading(true);
      const res = await fetch("/api/telegram/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: `${telegramId}`,
          tokenAddress: data.tokenAddress,
          percent: percent,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const result = await res.json();
      console.log("Sell result:", result);
      // alert(JSON.stringify(result, null, 2));

      if (result.status === true && result.txHash) {
        // alert("Transaction passed");
        setSuccessful(true);
      } else {
        // alert("Transaction failed");
        setFailed(true);
        setErr(result.message || "Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error selling position:", error);
      // alert("Catch block: " + error.message);
      setFailed(true);
      setErr(error.message || "An unexpected error occurred.");
    } finally {
      setSellLoading(false);
    }
  };

  if (loading || sellLoading) {
    return (
      <svg
        className="animate-spin h-10 w-10 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }
  return (
    <>
      <div className="bg-black border border-zinc-800 rounded-xl p-4 w-full max-w-sm text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-1">
              {data.tokenTicker}
              <span className="text-xs text-zinc-400">
                ({data.tokenSymbol})
              </span>
            </h2>
            <div className="text-xs text-zinc-400 space-x-2 mt-1">
              <span>
                5m:{" "}
                <span
                  className={
                    Number(data.token5MChange) < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {data.token5MChange !== "undefined"
                    ? data.token5MChange
                    : "--"}
                </span>
              </span>
              <span>
                1h:{" "}
                <span
                  className={
                    Number(data.tokenh1Change) < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {data.tokenh1Change !== "undefined"
                    ? data.tokenh1Change
                    : "--"}
                </span>
              </span>
              <span>
                24h:{" "}
                <span
                  className={
                    Number(data.tokenh24Change) < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {data.tokenh24Change !== "undefined"
                    ? data.tokenh24Change
                    : "--"}
                </span>
              </span>
            </div>
          </div>
          <div>
            <div className="flex gap-2">
              <button className="border border-zinc-700 px-2 py-1 rounded text-md">
                PNL Card
              </button>
              <button
                className="border border-zinc-700 px-2 py-1 rounded text-xs"
                onClick={onClose}
              >
                <X />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center text-sm">
          <div className="bg-zinc-900 p-2 rounded">
            <div className="text-zinc-400">Market Cap</div>
            <div>${formatter.format(Number(data.tokenMC))}</div>
          </div>
          <div className="bg-zinc-900 p-2 rounded">
            <div className="text-zinc-400">Liquidity</div>
            <div>${formatter.format(data.tokenLiquidity)}</div>
          </div>
          <div className="bg-zinc-900 p-2 rounded">
            <div className="text-zinc-400">Price</div>
            <div>
              {data.currentPriceUsd} {data.tokenSymbol}
            </div>
          </div>
          <div className="bg-zinc-900 p-2 rounded">
            <div className="text-zinc-400">Volume 24H</div>
            <div>${formatter.format(Number(data.volume24h))}</div>
          </div>
          <div className="bg-zinc-900 p-2 rounded">
            <div className="text-zinc-400">Capital</div>
            <div>
              {data.amountHeldSol.toFixed(4)} SOL ($
              {(data.amountHeld * data.currentPriceUsd).toFixed(2)})
            </div>
          </div>
          <div className="bg-zinc-900 p-2 rounded">
            <div className="text-zinc-400">PNL</div>
            <div
              className={
                data.PNL_Sol_percent >= 0 ? "text-green-500" : "text-red-500"
              }
            >
              {data.PNL_sol.toFixed(4)} SOL ({data.PNL_Sol_percent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="text-start text-zinc-400 text-xs mt-4">
          Balance: {solBalance.toFixed(2)} SOL
        </div>

        <div className="grid grid-cols-5 gap-1 mt-2 text-xs">
          {[0.1, 0.5, 1, 5, 10].map((v) => (
            <button
              key={v}
              onClick={() => (isSimulation ? handleSimBuy(v) : handleBuy(v))}
              disabled={solBalance < v}
              className={`bg-green-700 hover:bg-green-600 p-2 rounded text-xs
              ${solBalance < v ? "opacity-50 cursor-not-allowed" : ""}
            `}
            >
              {v} Sol
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1 mt-1 text-xs">
          {[25, 50, 75, 100].map((v) => (
            <button
              key={v}
              className="bg-red-700 hover:bg-red-600 p-2 rounded"
              onClick={() =>
                isSimulation
                  ? handleSellSimPositions(v)
                  : handleSellRealPositions(v)
              }
            >
              {v}%
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3 items-center mt-3 text-zinc-400 text-xl">
          {data.websiteUrl && (
            <a href={data.websiteUrl} target="_blank" rel="noopener noreferrer">
              <Link />
            </a>
          )}
          {data.twitterUrl && (
            <a href={data.twitterUrl} target="_blank" rel="noopener noreferrer">
              <FaXTwitter />
            </a>
          )}
          {data.telegramUrl && (
            <a
              href={data.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTelegram />
            </a>
          )}
        </div>

        {buySuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#141414] border border-green-600 rounded-lg p-6 w-full max-w-md text-center shadow-lg text-white">
              <h2 className="text-xl font-bold text-green-400 mb-3">
                Transaction Successful
              </h2>

              <div className="w-40 h-40 mx-auto">
                <Lottie animationData={success} loop={false} />
              </div>

              <p className="text-sm mt-4 text-white/80">
                Your transaction was successful!
              </p>

              <a
                href={txHash}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#E6B911] underline mt-2 block break-all hover:text-[#f5d13b] transition-colors"
              >
                View on Solscan ↗
              </a>

              <p className="text-xs text-gray-400 mt-4">
                Redirecting to homepage in {countdown} second
                {countdown !== 1 ? "s" : ""}...
              </p>
            </div>
          </div>
        )}
        {successful && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#141414] border border-green-600 rounded-lg p-6 w-full max-w-md text-center shadow-lg text-white">
              <h2 className="text-xl font-bold text-green-400 mb-3">
                Transaction Successful
              </h2>

              <div className="w-40 h-40 mx-auto">
                <Lottie animationData={success} loop={false} />
              </div>

              <p className="text-sm mt-4 text-white/80">
                Your transaction was successful!
              </p>

              <a
                href={sellTxHash}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#E6B911] underline mt-2 block break-all hover:text-[#f5d13b] transition-colors"
              >
                View on Solscan ↗
              </a>

              <p className="text-xs text-gray-400 mt-4">
                Redirecting to homepage in {countdown} second
                {countdown !== 1 ? "s" : ""}...
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PositionModal;
