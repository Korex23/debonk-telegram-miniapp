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
  const { telegramData, isSimulation, userData } = useUserData();
  const solPrice = userData?.solUsdPrice || 0;

  const [amount, setAmount] = useState<number>(0); // amount in SOL
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const tokenUsdValue = position.amountHeld * position.currentPriceUsd;
  const amountInUsd = amount * solPrice;

  const handleSellRealPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/telegram/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: telegramData?.id,
          tokenAddress: position.tokenAddress,
          amountOrType: "AMOUNT",
          amount,
        }),
      });

      const rawResponse = await res.text();
      console.log("Raw response:", rawResponse);
      setModalOpen(false);
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

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

      const rawResponse = await res.text();
      console.log("Raw response:", rawResponse);
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-4 w-full mx-auto font-exo2 shadow space-y-4">
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

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">Amount Held</p>
            <p className="text-sm text-white font-medium">
              {Number(position.amountHeld).toFixed(3)} {position.tokenSymbol}
            </p>
            <p className="text-xs text-gray-400">
              ≈ ${Number(tokenUsdValue).toFixed(4)}
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

        {isSimulation ? (
          <button
            className="bg-[#E82E2E] hover:bg-[#ff4d4d] text-white text-xs font-semibold py-2 rounded-lg w-full transition duration-200 ease-in-out shadow-sm"
            onClick={handleSellPositions}
          >
            {loading ? "Selling" : "Sell 100%"}
          </button>
        ) : (
          <button
            className="bg-[#E82E2E] hover:bg-[#ff4d4d] text-white text-xs font-semibold py-2 rounded-lg w-full transition duration-200 ease-in-out shadow-sm"
            onClick={() => setModalOpen(true)}
          >
            Sell Position
          </button>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#181818] rounded-lg p-6 w-[90%] max-w-md text-white shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Sell Token</h3>
            <p className="text-sm text-gray-400">
              Enter amount in SOL to sell for{" "}
              <strong>{position.tokenTicker}</strong>
            </p>
            <input
              type="number"
              className="w-full px-3 py-2 text-sm bg-[#1f1f1f] border border-gray-600 rounded-md focus:outline-none"
              placeholder="Amount in SOL"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step="0.001"
            />

            <div className="text-sm space-y-1">
              <p className="text-gray-400">
                ≈{" "}
                <span className="text-white font-semibold">
                  ${amountInUsd.toFixed(2)}
                </span>{" "}
                USD
              </p>
              <p className="text-gray-400">
                You currently hold ≈{" "}
                <span className="text-white font-semibold">
                  ${tokenUsdValue.toFixed(2)}
                </span>{" "}
                of {position.tokenTicker}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="text-sm px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSellRealPositions}
                disabled={loading || amount <= 0}
                className="text-sm px-4 py-2 bg-red-600 rounded-md hover:bg-red-500 disabled:opacity-50"
              >
                {loading ? "Selling..." : "Confirm Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionCard;
