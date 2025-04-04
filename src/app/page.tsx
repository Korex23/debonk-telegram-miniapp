"use client";

import MainDashboardCard from "@/FE/dashboard/MainDashboardCard";
import PositionCard from "@/FE/positions/Position";
import { generateRandomPosition } from "@/utils/RandomPositions";

import { useEffect, useState } from "react";

const DashboardPage: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await res.json();

      setPrice(data.solana?.usd || null);
    };

    fetchPrice();
  }, []);
  return (
    <>
      <main className="mt-16">
        <div className="p-3 w-full mx-auto">
          <MainDashboardCard />
        </div>
        <div className="p-3 w-full max-w-[360px] mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Positions Overview
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-150px)]">
            {Array.from({ length: 3 }, generateRandomPosition).map(
              (position, index) => (
                <PositionCard key={index} position={position} price={price} />
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
