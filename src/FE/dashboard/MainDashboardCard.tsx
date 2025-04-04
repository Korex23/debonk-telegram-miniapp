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

interface Button {
  label: string;
  icon: React.ReactNode;
}

const MainDashboardCard: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  //   const [loading, setLoading] = useState<boolean>(false);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [unrealizedPNL, setUnrealizedPNL] = useState<number>(0);
  const [shortenedAddress, setShortenedAddress] = useState<string>("");
  const position = generateRandomPosition(); // Generate a random position

  const buttons: Button[] = [
    {
      label: "Deposit",
      icon: <PiHandDepositFill className="text-[25px]" color="#CC920F" />,
    },
    {
      label: "Withdraw",
      icon: <PiHandWithdrawFill className="text-[25px]" color="#CC920F" />,
    },
    {
      label: "Refresh",
      icon: <SlRefresh className="text-[25px]" color="#CC920F" />,
    },
  ];

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

  console.log(position.pnlColor);

  return (
    <section className="mb-5 bg-[#3C3C3C3B] backdrop-blur-2xl border-[#CC920F] border-[.5px] text-white shadow-lg rounded-xl p-3 w-full max-w-[360px] mx-auto">
      {/* Wallet Address Section */}
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-light`}>
            <span className="text-[#FEF2C5]">Unrealized PNL: </span>
            <span className={`${position.pnlColor}`}>
              {Math.round(unrealizedPNL)}%
            </span>
          </p>
          <p className="text-xs text-[#E3B419] font-light">
            {" "}
            {price !== null ? `$${(solBalance * price).toFixed(2)}` : "$0.00"}
          </p>
        </div>
        <button className="flex gap-1 items-center text-xs text-accent rounded-xl shadow-lg border border-accent px-3 py-1 text-[#CC920F]">
          <PiTestTubeFill className="text-sm" /> Simulation
        </button>
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="flex gap-1 relative text-sm text-primary text-[#CC920F]">
          <span>{`${shortenedAddress}`}</span>
          <IoCopySharp
            className="cursor-pointer text-[15px]"
            onClick={handleCopyAddress}
            title="Copy Address"
          />
        </p>
        <h2 className="text-[34px]">{solBalance.toFixed(2)} SOL</h2>
        <p className="text-primary flex gap-[2px] items-center text-[#CC920F]">
          {price !== null ? `$${(solBalance * price).toFixed(2)}` : "$0.00"}
          <CiCircleAlert className="text-xs" />
        </p>
      </div>

      <button className="flex text-sm gap-1 pt-2 items-center mx-auto font-poppins">
        Demo <GiPlainCircle className="text-[#1DD75B] text-xs font-light" />
      </button>

      {/* Action Buttons */}
      <div className="flex mx-auto justify-around mt-4 text-[10px] text-accent font-light space-x-3 w-[80%]">
        {buttons.map((button, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-[3px] p-2 rounded-lg shadow border border-[#CC920F] border-accent w-[60px] font-poppins tracking-wide text-[#CC920F]"
          >
            {button.icon}
            {button.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default MainDashboardCard;
