"use client";

import { useUserData } from "../context/user-provider";
import success from "@/assets/success.json";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const BuyPositions = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showSlideUp, setShowSlideUp] = useState(false);
  const [amountToken, setAmountToken] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetchingTokenData, setFethcingTokenData] = useState(false);
  const [successful, setSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState("");
  const [countdown, setCountdown] = useState(5);
  const { telegramData } = useUserData();
  const telegramId = telegramData?.id;
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successful && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (successful && countdown === 0) {
      router.push("/");
    }
    return () => clearTimeout(timer);
  }, [successful, countdown]);

  const fetchTokenData = async () => {
    if (!telegramId) {
      alert("Telegram ID is missing. Please try again.");
      return;
    }
    try {
      setShowSlideUp(true);
      setFethcingTokenData(true);
      const res = await fetch(
        `/api/telegram/token?telegramId=${telegramId}&tokenAddress=${tokenAddress}`
      );
      const data = await res.json();
      if (data?.token && data?.user) {
        setTokenInfo(data.token);
        setUserInfo(data.user);
        setShowSlideUp(true);
      } else {
        setTokenInfo(null);
        setShowSlideUp(false);
      }
    } catch (err) {
      console.error("Failed to fetch token info:", err);
      setShowSlideUp(false);
    } finally {
      setFethcingTokenData(false);
    }
  };

  useEffect(() => {
    if (!tokenAddress || tokenAddress.length < 32) return;

    const timer = setTimeout(() => {
      if (tokenAddress.length >= 32) {
        fetchTokenData();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [tokenAddress]);

  const handleBuy = async () => {
    if (!amountToken || !tokenInfo?.priceSol) return;

    const amountInSol = amountToken * Number(tokenInfo.priceSol);

    try {
      setLoading(true);
      const res = await fetch("/api/telegram/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId,
          tokenAddress,
          amount: amountInSol,
        }),
      });

      const result = await res.json();
      console.log("Buy Result:", result);
      setShowSlideUp(false);
      setTxHash(result.transactionLink);
      setSuccess(true);
      setAmountToken(0);
      setTokenAddress("");
    } catch (error) {
      console.error("Buy error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-xl mx-auto px-4 py-8 text-white">
      <div className="mb-4">
        <label
          htmlFor="tokenAddress"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Token Address
        </label>
        <input
          id="tokenAddress"
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter or paste token address"
          className="w-full px-4 py-3 text-sm bg-[#1f1f1f] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E6B911] transition-all"
        />
      </div>

      {showSlideUp && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-40 md:items-center md:p-4 mb-14">
          <div className="w-full max-w-md bg-[#181818] border border-yellow-400 rounded-t-xl md:rounded-xl p-6 z-50 shadow-lg space-y-4 animate-slide-up">
            {fetchingTokenData || loading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-10">
                <svg
                  className="animate-spin h-6 w-6 text-yellow-400"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {fetchingTokenData
                  ? "Loading Token Data..."
                  : "Processing transaction..."}
              </div>
            ) : (
              tokenInfo &&
              userInfo && (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {tokenInfo.name} ({tokenInfo.symbol})
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        {tokenInfo.address.substring(0, 6)}...
                        {tokenInfo.address.substring(
                          tokenInfo.address.length - 4
                        )}
                      </p>
                    </div>
                    <a
                      href={tokenInfo.dexscreenerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#CC920F] underline hover:text-[#E6B911] transition-colors"
                    >
                      View on Dexscreener
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#1f1f1f] p-3 rounded-lg">
                      <p className="text-gray-400">Market Cap</p>
                      <p>${Number(tokenInfo.mc).toLocaleString()}</p>
                    </div>
                    <div className="bg-[#1f1f1f] p-3 rounded-lg">
                      <p className="text-gray-400">Liquidity</p>
                      <p>${Number(tokenInfo.liquidityUsd).toLocaleString()}</p>
                    </div>
                    <div className="bg-[#1f1f1f] p-3 rounded-lg">
                      <p className="text-gray-400">Price (SOL)</p>
                      <p>{tokenInfo.priceSol}</p>
                    </div>
                    <div className="bg-[#1f1f1f] p-3 rounded-lg">
                      <p className="text-gray-400">Price (USD)</p>
                      <p>${tokenInfo.priceUsd}</p>
                    </div>
                  </div>

                  <div className="bg-[#1f1f1f] p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Your Balance</p>
                    <p className="font-medium">
                      {userInfo.tokenBalance} {tokenInfo.symbol} (≈ $
                      {userInfo.tokenBalanceUsd.toFixed(4)})
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label
                      htmlFor="amount"
                      className="block text-sm text-gray-300"
                    >
                      Amount to Buy
                    </label>
                    <input
                      id="amount"
                      type="number"
                      placeholder={`Amount in ${tokenInfo.symbol}`}
                      value={amountToken}
                      onChange={(e) =>
                        setAmountToken(Number(e.target.value) || 0)
                      }
                      className="w-full px-4 py-2 text-sm bg-[#1a1a1a] border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E6B911]"
                      min={0}
                      step="0.001"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-400">
                      ≈ {(amountToken * Number(tokenInfo.priceSol)).toFixed(4)}{" "}
                      SOL
                    </p>
                  </div>

                  <div className="flex justify-end pt-2 space-x-3">
                    <button
                      onClick={() => setShowSlideUp(false)}
                      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBuy}
                      disabled={loading || amountToken <= 0}
                      className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-24"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Buying...
                        </>
                      ) : (
                        "Confirm Buy"
                      )}
                    </button>
                  </div>
                </>
              )
            )}
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
    </div>
  );
};

export default BuyPositions;
