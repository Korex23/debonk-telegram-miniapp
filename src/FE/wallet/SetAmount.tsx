"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWithdrawStore } from "@/stores/useWithdrawStore";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";

const SetAmount: React.FC = () => {
  const { setAmount, selectedWallet } = useWithdrawStore();
  const router = useRouter();

  const [amountInput, setAmountInput] = useState<string>(""); // Now in SOL
  const [solPrice, setSolPrice] = useState<number>(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState(130);
  const [error, setError] = useState<boolean>(false);

  const handleSetAmount = () => {
    if (amountInput.trim() !== "") {
      setAmount(parseFloat(amountInput));

      router.push("/withdraw/confirm");
    } else if (amountInput.trim() === "") {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000); // Clear error after 2 seconds
    }
  };

  useEffect(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.offsetWidth;
      setInputWidth(Math.max(spanWidth + 20, 130)); // +20 for padding, min 70
    }
  }, [amountInput]);

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error("Error fetching Solana price:", error);
      }
    };

    fetchSolPrice();
  }, []);

  const solAmount = parseFloat(amountInput) || 0;
  const usdValue = solPrice ? solAmount * solPrice : 0;

  return (
    <div className="flex items-center justify-center flex-col h-screen bg-[#080808] p-4 relative">
      {/* Back Button */}

      <button
        className="absolute top-4 left-4 text-white opacity-80 hover:opacity-100"
        onClick={() => router.back()}
      >
        <IoArrowBack size={24} color="#E6B911" />
      </button>

      <div className="md:w-[360px] max-w-[360px] w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white font-poppins">
            Enter Amount
          </h1>
        </div>

        <div className="flex flex-col justify-between bg-[#141414] w-full max-w-sm rounded-2xl px-6 shadow-xl text-white space-y-6">
          <p className="text-sm text-gray-400 text-center py-3 font-exo2">
            Recipient:{" "}
            {selectedWallet
              ? `${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-4)}`
              : "recipient"}
          </p>
          {/* USD Equivalent */}
          <div className="text-center font-exo2">
            <p className="text-4xl font-bold text-white tracking-tight break-words">
              ${usdValue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Approx. USD</p>
          </div>

          {/* SOL Input */}
          <div className="flex justify-center pb-8">
            <div
              className={`relative transition-all duration-200 ease-in-out`}
              style={{ width: `${inputWidth}px` }}
            >
              {/* Label */}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-sm font-medium pointer-events-none bg-[#262626] px-2 py-[2px] rounded-md">
                SOL
              </span>

              {/* Input */}
              <input
                ref={inputRef}
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className={`pl-14 pr-4 py-3 text-2xl font-semibold text-center rounded-2xl w-full transition-all duration-300 no-spinner placeholder-white tracking-tight font-exo2
    ${
      error
        ? "bg-[#2e0f0f] border border-red-500 text-red-300 placeholder-red-300 focus:ring-2 focus:ring-red-500"
        : "bg-[#101010] text-white placeholder-gray-400 focus:outline-none"
    }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />

              {/* Width Calculator */}
              <span
                ref={spanRef}
                className="invisible absolute top-0 left-0 whitespace-pre text-xl"
              >
                {amountInput || "0.00"}
              </span>
            </div>
          </div>
        </div>
        {/* Continue Button */}
        <button
          onClick={handleSetAmount}
          className="mt-6 w-full max-w-sm py-3 bg-gradient-to-br from-[#E6B911] to-[#cc920f] text-black font-semibold rounded-xl transition hover:opacity-90 shadow-md cursor-pointer"
        >
          Continue
        </button>
      </div>
      {error && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300 ${
            error ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          Amount cannot be zero
        </div>
      )}
    </div>
  );
};

export default SetAmount;
