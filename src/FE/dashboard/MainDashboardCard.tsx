"use client";

import { generateRandomCryptoAddress } from "@/utils/RandomCryptoAddress";
import React, { useState, useEffect, useCallback } from "react";
import { IoCopySharp } from "react-icons/io5";
import {
  PiHandWithdrawFill,
  PiHandDepositFill,
  PiTestTubeFill,
} from "react-icons/pi";
import { SlRefresh } from "react-icons/sl";
import { CiCircleAlert } from "react-icons/ci";
import { GiPlainCircle } from "react-icons/gi";
import { generateRandomPosition } from "@/utils/RandomPositions";
import Link from "next/link";
// import { useRouter } from "next/router";

interface Button {
  label: string;
  icon: React.ReactNode;
  href?: string;
  actions?: () => void;
}

const MainDashboardCard: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  //   const [loading, setLoading] = useState<boolean>(false);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [unrealizedPNL, setUnrealizedPNL] = useState<number>(0);
  const [shortenedAddress, setShortenedAddress] = useState<string>("");
  const position = generateRandomPosition(); // Generate a random position
  // const router = useRouter();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        const data = await res.json();
        setPrice(data.solana?.usd || null);
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };
    fetchPrice();
  }, []);

  useEffect(() => {
    // Simulate balance and unrealized PNL
    setSolBalance(position.capital);
    setUnrealizedPNL(position.pnlPercentage);
  }, []);

  const generateAddress = useCallback(() => {
    // setLoading(true);
    setAddress(generateRandomCryptoAddress());
    setShortenedAddress(`${address.slice(0, 6)}...${address.slice(-4)}`);
    console.log(shortenedAddress);
    // console.log(address);

    // setLoading(false);
  }, []);

  useEffect(() => {
    generateAddress(); // Generate address on component mount
  }, [generateAddress]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Address copied to clipboard!");
    }
  };

  const buttons: Button[] = [
    {
      label: "Deposit",
      icon: <PiHandDepositFill className="text-[25px]" color="#CC920F" />,
      href: "/deposit",
    },
    {
      label: "Withdraw",
      icon: <PiHandWithdrawFill className="text-[25px]" color="#CC920F" />,
      href: "/withdraw",
    },
    {
      label: "Refresh",
      icon: <SlRefresh className="text-[25px]" color="#CC920F" />,
      actions: () => {
        window.location.reload();
      },
    },
  ];

  //   console.log(position.pnlColor);

  return (
    <section className="mb-5 bg-[#3C3C3C3B] font-exo2 backdrop-blur-2xl border border-[#CC920F]/50 text-white shadow-md rounded-2xl p-4 w-full max-w-[360px] mx-auto space-y-4">
      {/* Top Section: PNL + Simulation */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-light">
            <span className="text-[#FEF2C5]">Unrealized PNL: </span>
            <span className={`${position.pnlColor}`}>
              {Math.round(unrealizedPNL)}%
            </span>
          </p>
          <p className="text-xs text-[#E3B419] font-light">
            {price !== null ? `$${(solBalance * price).toFixed(2)}` : "$0.00"}
          </p>
        </div>

        <button className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-[#CC920F] border border-[#CC920F] rounded-xl bg-[#1a1a1a]/40 hover:bg-[#2c2c2c] transition-all shadow-sm">
          <PiTestTubeFill className="text-sm" /> Simulation
        </button>
      </div>

      {/* Wallet + Balance */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-[#CC920F]">
          <span>{shortenedAddress}</span>
          <IoCopySharp
            className="cursor-pointer hover:opacity-80 transition text-base"
            onClick={handleCopyAddress}
            title="Copy Address"
          />
        </div>

        <h2 className="text-3xl font-semibold">{solBalance.toFixed(2)} SOL</h2>

        <p className="text-xs text-[#CC920F] flex items-center justify-center gap-1">
          {price !== null ? `$${(solBalance * price).toFixed(2)}` : "$0.00"}
          <CiCircleAlert className="text-sm" />
        </p>
      </div>

      {/* Demo Status */}
      <div className="text-center">
        <button className="flex items-center gap-1 text-xs text-[#1DD75B] font-medium mx-auto">
          Demo <GiPlainCircle className="text-[10px]" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-2 text-xs font-light text-[#CC920F]">
        {buttons.map((button, index) => (
          <Link href={button?.href ?? ""} key={index}>
            <button
              className="flex flex-col items-center gap-1 w-[64px] px-2 py-2 rounded-lg border border-[#CC920F]/60 shadow-sm hover:bg-[#333] transition font-poppins text-center"
              onClick={button.actions}
            >
              <span className="text-base">{button.icon}</span>
              <span>{button.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MainDashboardCard;
