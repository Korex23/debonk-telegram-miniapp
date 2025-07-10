import { useUserData } from "../context/user-provider";
import React, { useState } from "react";

const BuyPositions = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showSlideUp, setShowSlideUp] = useState(false);
  const [amountToken, setAmountToken] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const telegramId = "7023048964";
  const { telegramData } = useUserData();

  const fetchTokenData = async () => {
    try {
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
    }
  };

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

      const result = await res.text();
      console.log("Buy Result:", result);
      setShowSlideUp(false);
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
      <input
        type="text"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        placeholder="Enter or paste token address"
        className="w-full px-4 py-3 text-sm bg-[#1f1f1f] border border-gray-700 rounded-md focus:outline-none"
        onBlur={() => {
          if (tokenAddress.length >= 32) fetchTokenData();
        }}
      />

      {showSlideUp && tokenInfo && userInfo && (
        <div className="fixed inset-x-0 bottom-10 bg-[#181818] border-t border-gray-700 rounded-t-xl p-6 z-50 shadow-lg space-y-4 animate-slide-up transition-all">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {tokenInfo.name} ({tokenInfo.symbol})
            </h2>
            <a
              href={tokenInfo.dexscreenerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 underline"
            >
              View on Dexscreener
            </a>
          </div>

          <div className="text-sm space-y-1">
            <p>Market Cap: ${Number(tokenInfo.mc).toLocaleString()}</p>
            <p>Liquidity: ${Number(tokenInfo.liquidityUsd).toLocaleString()}</p>
            <p>Price (SOL): {tokenInfo.priceSol}</p>
            <p>Price (USD): ${tokenInfo.priceUsd}</p>
            <hr className="border-gray-600 my-2" />
            <p>
              Your Token Balance: {userInfo.tokenBalance} {tokenInfo.symbol}
            </p>
            <p>≈ ${userInfo.tokenBalanceUsd.toFixed(4)}</p>
          </div>

          <div className="space-y-2 pt-2">
            <input
              type="number"
              placeholder={`Amount in ${tokenInfo.symbol}`}
              value={amountToken}
              onChange={(e) => setAmountToken(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 text-sm bg-[#1f1f1f] border border-gray-600 rounded-md focus:outline-none"
              min={0}
              step="0.001"
            />
            <p className="text-xs text-gray-400">
              ≈ {(amountToken * Number(tokenInfo.priceSol)).toFixed(4)} SOL
            </p>
          </div>

          <div className="flex justify-end pt-2 space-x-3">
            <button
              onClick={() => setShowSlideUp(false)}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={loading || amountToken <= 0}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-sm disabled:opacity-50"
            >
              {loading ? "Buying..." : "Confirm Buy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyPositions;
