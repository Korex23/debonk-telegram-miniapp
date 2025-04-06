import React from "react";
import { Position } from "@/types/Position";

interface PositionCardProps {
  position: Position;
  price: number | null;
}

const PositionCard: React.FC<PositionCardProps> = ({ position, price }) => {
  return (
    <div className="bg-[#141414] px-4 py-3 rounded-xl w-full max-w-[350px] mx-auto font-exo2 shadow-md border border-[#1f1f1f] space-y-3">
      <div className="flex justify-between items-start">
        {/* Token Info */}
        <div>
          <div className="text-white text-base font-semibold">
            {position.name}
          </div>
          <p className="text-xs text-gray-400">MC: ${position.mc}</p>
          <p className="text-xs text-gray-400">
            LIQ: ${position.liq.toFixed(2)}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-gray-400 font-light">PNL</p>
            <p className={`text-sm font-bold ${position.pnlColor}`}>
              {position.pnl.toFixed(2)} SOL
            </p>
            <p className={`text-[11px] ${position.pnlColor}`}>
              ${price !== null ? (position.pnlSol * price).toFixed(2) : "0.00"}
            </p>
            <p className={`text-[11px] ${position.pnlColor}`}>
              {position.pnlPercentage.toFixed(2)}%
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-light">Capital</p>
            <p className="text-sm text-white">
              {position.capital.toFixed(2)} SOL
            </p>
            <p className="text-[11px] text-gray-300">
              $
              {price !== null
                ? (position.capital * price).toFixed(2)
                : "Loading"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-light">Value</p>
            <p className="text-sm text-white">
              {position.value.toFixed(2)} SOL
            </p>
            <p className="text-[11px] text-gray-300">
              $
              {price !== null ? (position.value * price).toFixed(2) : "Loading"}
            </p>
          </div>
        </div>
      </div>

      <button className="bg-[#E82E2E] hover:bg-[#ff4d4d] text-white text-xs font-semibold py-2 rounded-lg w-full transition duration-200 ease-in-out shadow-sm">
        Sell 100%
      </button>
    </div>
  );
};

export default PositionCard;
