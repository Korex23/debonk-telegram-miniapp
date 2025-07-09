import { UserPositionSummary, useUserData } from "@/FE/context/user-provider";
import React, { useState } from "react";

interface PositionCardProps {
  position: UserPositionSummary;
}

const getPnlColor = (percent: number) => {
  if (percent > 0) return "text-green-400";
  if (percent < 0) return "text-red-400";
  return "text-gray-400";
};

const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
  const pnlColor = getPnlColor(position.PNL_Sol_percent);
  const [loading, setLoading] = useState<boolean>(false);
  const { telegramData } = useUserData();

  const handleSellPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/telegram/simulation/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: telegramData?.id,
          tokenAddress: position.tokenAddress,
          percentToSell: 100,
        }),
      });

      // Log the raw response text
      const rawResponse = await res.text();
      console.log("Raw response:", rawResponse);
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-4 w-full mx-auto font-exo2 shadow space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">
            {position.tokenTicker}
          </h2>
          <p className="text-xs text-gray-400">{position.tokenSymbol}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Price</p>
          <p className="text-base text-white font-semibold">
            ${Number(position.currentPriceUsd).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Amount Held */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">Amount Held</p>
          <p className="text-sm text-white font-medium">
            {Number(position.amountHeld).toFixed(3)} {position.tokenSymbol}
          </p>
          <p className="text-xs text-gray-400">
            ≈ $
            {Number(position.amountHeld * position.currentPriceUsd).toFixed(4)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Liquidity</p>
          <p className="text-sm text-white">
            ${Number(position.tokenLiquidity).toLocaleString()}
          </p>
          {position.tokenMC !== undefined && (
            <p className="text-xs text-gray-400">
              MC: ${Number(position.tokenMC).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* PNL Section */}
      <div className="flex justify-between items-center border-t border-[#1f1f1f] pt-3">
        <div>
          <p className="text-xs text-gray-400">PNL (SOL)</p>
          <p className={`text-sm font-bold ${pnlColor}`}>
            {Number(position.PNL_sol).toFixed(6)} SOL
          </p>
          <p className={`text-xs ${pnlColor}`}>
            ≈ ${Number(position.PNL_usd).toFixed(4)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">PNL %</p>
          <p className={`text-sm font-bold ${pnlColor}`}>
            {Number(position.PNL_Sol_percent).toFixed(2)}%
          </p>
        </div>
      </div>

      <button
        className="bg-[#E82E2E] hover:bg-[#ff4d4d] text-white text-xs font-semibold py-2 rounded-lg w-full transition duration-200 ease-in-out shadow-sm"
        onClick={handleSellPositions}
      >
        {loading ? "Selling" : "Sell 100%"}
      </button>
    </div>
  );
};

export default PositionCard;
