"use client";

import { useUserData } from "../context/user-provider";
import { generateRandomPosition } from "@/utils/RandomPositions";
import { splitStringInMiddle } from "@/utils/lib";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { CiCircleAlert } from "react-icons/ci";
import { GiPlainCircle } from "react-icons/gi";
import { IoCopySharp } from "react-icons/io5";
import {
  PiHandWithdrawFill,
  PiHandDepositFill,
  PiTestTubeFill,
} from "react-icons/pi";
import { SlRefresh } from "react-icons/sl";

interface Button {
  label: string;
  icon: React.ReactNode;
  href?: string;
  actions?: () => void;
}

const MainDashboardCard: React.FC = () => {
  const [unrealizedPNL, setUnrealizedPNL] = useState<number>(0);
  const { userData, handleSetSimulation, isSimulation } = useUserData();
  const [showSimulationModal, setShowSimulationModal] =
    useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const position = generateRandomPosition();

  useEffect(() => {
    setUnrealizedPNL(position.pnlPercentage);
  }, []);

  const toggleSimulation = () => {
    const newMode = !isSimulation;
    handleSetSimulation();

    // Set modal message based on new mode
    setModalMessage(
      newMode
        ? "You are now in Simulation Mode"
        : "You are leaving Simulation Mode"
    );

    setShowSimulationModal(true);

    // Auto-hide modal after 2 seconds
    setTimeout(() => {
      setShowSimulationModal(false);
    }, 2000);
  };

  const handleCopyAddress = () => {
    if (userData?.address) {
      navigator.clipboard.writeText(userData.address);
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

  return (
    <section className="mb-5 bg-[#3C3C3C3B] font-exo2 backdrop-blur-2xl border border-[#CC920F]/50 text-white shadow-md rounded-2xl p-4 w-full max-w-[390px] mx-auto space-y-4">
      {/* Simulation Mode Modal */}
      {showSimulationModal && (
        <div className="fixed inset-0 z-50 flex items-center h-[80vh] justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#F2C94C] max-w-[90vw] w-[300px] sm:w-[360px] px-6 py-8 rounded-xl shadow-xl text-center animate-fade-in-out space-y-4">
            <h2 className="text-black text-lg font-bold">Simulation Notice</h2>
            <p className="text-black text-sm">{modalMessage}</p>
            <button
              onClick={() => setShowSimulationModal(false)}
              className="mt-4 bg-black text-[#F2C94C] text-xs px-4 py-2 rounded-full hover:bg-gray-900 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-light">
            <span className="text-[#FEF2C5]">Unrealized PNL: </span>
            <span className={`${position.pnlColor}`}>
              {Math.round(unrealizedPNL)}%
            </span>
          </p>
          <p className="text-xs text-[#E3B419] font-light">
            {isSimulation
              ? `$${userData?.simulationUsd?.toLocaleString() ?? 0}`
              : `$${userData?.solUsdBalance?.toLocaleString() ?? 0}`}
          </p>
        </div>

        <button
          className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-xl transition-all shadow-sm ${
            isSimulation
              ? "bg-[#CC920F] text-black border border-[#CC920F] hover:bg-[#E3B419]"
              : "text-[#CC920F] border border-[#CC920F] bg-[#1a1a1a]/40 hover:bg-[#2c2c2c]"
          }`}
          onClick={toggleSimulation}
        >
          <PiTestTubeFill className="text-sm" />
          {isSimulation ? "Exit Simulation" : "Simulation"}
        </button>
      </div>

      {/* Wallet + Balance */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-[#CC920F]">
          <span>{splitStringInMiddle(userData?.address ?? "", 5)}</span>
          <IoCopySharp
            className="cursor-pointer hover:opacity-80 transition text-base"
            onClick={handleCopyAddress}
            title="Copy Address"
          />
        </div>

        <h2 className="text-3xl font-semibold">
          {isSimulation
            ? Number(userData?.simulationBalance ?? 0).toFixed(4)
            : Number(userData?.balance ?? 0).toFixed(4)}{" "}
          SOL
        </h2>

        <p className="text-xs text-[#CC920F] flex items-center justify-center gap-1">
          {isSimulation
            ? `$${parseFloat(
                String(userData?.simulationUsd ?? 0)
              ).toLocaleString()}`
            : `$${parseFloat(
                String(userData?.solUsdBalance ?? 0)
              ).toLocaleString()}`}
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
