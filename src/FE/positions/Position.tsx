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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 w-[95%] max-w-md text-white shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Sell {position.tokenTicker}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="sell-amount"
                  className="text-sm font-medium text-gray-300"
                >
                  Amount to sell (SOL)
                </label>
                <span className="text-xs text-gray-400">
                  Balance: {userData?.balance.toFixed(4)} SOL
                </span>
              </div>
              <div className="relative">
                <input
                  id="sell-amount"
                  type="number"
                  className="w-full px-4 py-3 text-base bg-[#1f1f1f] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  min={0}
                  step="0.001"
                />
                <button
                  onClick={() => setAmount(userData?.balance || 0)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-md transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="bg-[#1f1f1f] rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Price</span>
                <span className="text-sm font-medium">
                  ${amountInUsd.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">
                  Your {position.tokenTicker} holdings
                </span>
                <span className="text-sm font-medium">
                  ${tokenUsdValue.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-3 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSellRealPositions}
                disabled={
                  loading || amount <= 0 || amount > (userData?.balance || 0)
                }
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  loading || amount <= 0 || amount > (userData?.balance || 0)
                    ? "bg-red-900/50 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    <span>Selling...</span>
                  </div>
                ) : (
                  "Confirm Sell"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionCard;
