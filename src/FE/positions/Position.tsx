import React from "react";
import { Position } from "@/types/Position";

interface PositionCardProps {
  position: Position;
  price: number | null;
}

const PositionCard: React.FC<PositionCardProps> = ({ position, price }) => {
  return (
    <div className="bg-[#141414] px-4 py-2 space-y-2 rounded-lg w-full max-w-[350px] mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <div className="text-lg text-white">{position.name}</div>
          </div>
          <p className="text-xs text-white font-extralight">
            MC ${position.mc}
          </p>
          <p className="text-xs text-white font-extralight">
            LIQ ${position.liq.toFixed(2)}
          </p>
        </div>

        <div className="flex space-x-4">
          <div>
            <p className="text-white text-xs font-normal">PNL</p>
            <div className={`text-[10px] font-bold ${position.pnlColor}`}>
              {position.pnl.toFixed(2)} SOL
            </div>
            <div className={`text-[10px] font-bold ${position.pnlColor}`}>
              $
              {price !== null
                ? (position.pnlSol * price).toFixed(2)
                : "Loading"}
            </div>
            <div className={`text-[10px] font-bold ${position.pnlColor}`}>
              {position.pnlPercentage.toFixed(2)}%
            </div>
          </div>

          <div className="text-xs">
            <p className="text-white font-normal">Capital</p>
            <p className="text-white font-extralight">
              {position.capital.toFixed(2)} SOL
            </p>
            <p className="text-white font-extralight">
              $
              {price !== null
                ? (position.capital * price).toFixed(2)
                : "Loading"}
            </p>
          </div>
          <div className="text-xs">
            <p className="text-white font-normal">Value</p>
            <p className="text-white font-extralight">
              {position.value.toFixed(2)} SOL
            </p>
            <p className="text-white font-extralight">
              $
              {price !== null ? (position.value * price).toFixed(2) : "Loading"}
            </p>
          </div>
        </div>
      </div>

      <button className="cursor-pointer bg-[#E82E2E] text-[#fff] font-extralight text-xs rounded-lg px-3 py-2 tracking-wide hover:bg-[#E82E2E] transition duration-200 ease-in-out w-full">
        Sell 100%
      </button>
    </div>
  );
};

export default PositionCard;
