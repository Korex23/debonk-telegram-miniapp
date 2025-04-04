"use client";

import { FaExternalLinkAlt } from "react-icons/fa";
import { IoCopySharp } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import { Position } from "@/types/Position";
import { generateRandomPosition } from "@/utils/RandomPositions";
import PositionCard from "./Position";

const PositionsCard: React.FC = () => {
  const positions: Position[] = Array.from(
    { length: 8 },
    generateRandomPosition
  );

  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await res.json();

      setPrice(data.solana?.usd || null); // Ensure correct data is used
    };

    fetchPrice();
  }, []);

  return (
    //  <main className="pt-0 p-3 pb-20 bg-black min-h-screen">
    //   <h2 className="text-2xl font-semibold text-center text-white mb-4">
    //     Positions
    //   </h2>
    //   <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-150px)]">
    //     {positions.map((position, index) => (
    //       <div
    //         key={index}
    //         className="bg-[#141414] px-4 py-2 space-y-2 rounded-lg border border-accent w-full max-w-[320px] mx-auto"
    //       >
    //         <div className="flex justify-between items-start">
    //           <div>
    //             <div className="flex items-center">
    //               <div className="text-lg text-white">{position.name}</div>
    //               {/* <IoCopySharp
    //                 className="cursor-pointer text-[10px] "
    //                 title="Copy Address"
    //               /> */}
    //             </div>
    //             <p className="text-xs text-white font-extralight">
    //               MC ${position.mc}
    //             </p>
    //             <p className="text-xs text-white font-extralight">
    //               LIQ ${position.liq.toFixed(2)}
    //             </p>
    //           </div>

    //           <div className="flex items-center space-x-4">
    //             <div className={`text-[10px] font-bold ${position.pnlColor}`}>
    //               {position.pnlPercentage.toFixed(2)}%
    //             </div>

    //             <div className="text-xs">
    //               <p className="text-white font-normal">Capital</p>
    //               <p className="text-white font-extralight">
    //                 {position.capital.toFixed(2)} SOL
    //               </p>
    //               <p className="text-white font-extralight">
    //                 $
    //                 {price !== null
    //                   ? (position.capital * price).toFixed(2)
    //                   : "Loading"}
    //               </p>
    //             </div>
    //             <div className="text-xs">
    //               <p className="text-white font-normal">Value</p>
    //               <p className="text-white font-extralight">
    //                 {position.value.toFixed(2)} SOL
    //               </p>
    //               <p className="text-white font-extralight">
    //                 $
    //                 {price !== null
    //                   ? (position.value * price).toFixed(2)
    //                   : "Loading"}
    //               </p>
    //             </div>
    //           </div>
    //         </div>

    //         <button className="bg-[#E82E2E] text-[#fff] font-extralight text-xs rounded-lg px-3 py-2 tracking-wide hover:bg-[#E82E2E] transition duration-200 ease-in-out w-full">
    //           Sell 100%
    //         </button>
    //       </div>

    //     ))}
    //   </div>
    // </main>
    <main className="pt-0 p-3 pb-20 bg-black min-h-screen">
      <h2 className="text-2xl font-semibold text-center text-white mb-4">
        Positions
      </h2>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-150px)]">
        {positions.map((position, index) => (
          <PositionCard key={index} position={position} price={price} />
        ))}
      </div>
    </main>
  );
};

export default PositionsCard;
