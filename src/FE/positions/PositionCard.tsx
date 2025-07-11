"use client";

import { useUserData } from "../context/user-provider";
import BuyPositions from "./BuyPositions";
import PositionCard from "./Position";
import React from "react";

const PositionsCard: React.FC = () => {
  const { positions, isSimulation, realPositions } = useUserData();

  const displayPositions = isSimulation ? positions : realPositions;

  return (
    <div className="p-2 w-full max-w-[400px] mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Positions Overview
      </h2>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-150px)]">
        <div className="space-y-4">
          {displayPositions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {displayPositions.map((position, index) => (
                <PositionCard key={index} position={position} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center rounded-lg border border-[#CC920F]/30 bg-[#2A2A2A]/40 shadow-md">
              <p className="text-lg font-medium text-[#CC920F]">
                No Positions Available
              </p>
              <p className="text-sm text-[#CCCCCC] mt-2 p-2">
                You don't have any active positions yet. Buy a token to start
                tracking.
              </p>
            </div>
          )}
        </div>
      </div>
      <BuyPositions />
    </div>
  );
};

export default PositionsCard;
