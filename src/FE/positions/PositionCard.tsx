"use client";

import { useUserData } from "../context/user-provider";
import BuyPositions from "./BuyPositions";
import PositionCard from "./Position";
import React from "react";

const PositionsCard: React.FC = () => {
  const { positions, isSimulation, realPositions } = useUserData();
  const displayPositions = isSimulation ? positions : realPositions;

  return (
    <main className="pt-0 p-3 bg-[#080808] min-h-screen w-full max-w-full">
      <h2 className="text-2xl font-semibold text-center text-white mb-4">
        Positions
      </h2>
      <div className="space-y-3 overflow-y-auto w-[95%] max-w-full mx-auto max-h-[calc(100vh-150px)]">
        <div className="space-y-4">
          {displayPositions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {displayPositions.map((position, index) => (
                <PositionCard key={index} position={position} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-[#CC920F]/30 bg-[#2A2A2A]/40 shadow-md">
              <p className="text-lg font-medium text-[#CC920F]">
                No {isSimulation && "Simulation"} Positions Available
              </p>
              <p className="text-sm text-[#CCCCCC] mt-2 p-2">
                You don&apos;t have any active positions yet. Buy a token to
                start tracking.
              </p>
            </div>
          )}
        </div>
      </div>
      <BuyPositions />
    </main>
  );
};

export default PositionsCard;
