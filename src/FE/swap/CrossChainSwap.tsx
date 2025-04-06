"use client";

import React, { useEffect, useState } from "react";
import { IoChevronDown, IoArrowBack } from "react-icons/io5";
import { FaExchangeAlt } from "react-icons/fa";
import { useSwapStore } from "@/stores/useSwapStore";
import ConfirmModal from "./ConfirmModal";
import { useRouter } from "next/navigation";

interface Token {
  symbol: string;
  chain: string;
  id: string;
}

const tokenList: Token[] = [
  { symbol: "USDT", chain: "BSC", id: "tether" },
  { symbol: "USDC", chain: "AVAX", id: "usd-coin" },
  { symbol: "SOL", chain: "Solana", id: "solana" },
];

const CrossChainSwap: React.FC = () => {
  const [payAmount, setPayAmount] = useState<string>("");
  const [receiveAmount, setReceiveAmount] = useState<string>("0.00");
  const [fromToken, setFromToken] = useState<Token>(tokenList[0]);
  const [toToken, setToToken] = useState<Token>(tokenList[1]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [recipient, setRecipient] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const router = useRouter();

  const { setSwapDetails, toggleConfirmModal } = useSwapStore();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = tokenList.map((t) => t.id).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        const data = await res.json();
        const priceMap: Record<string, number> = {};
        tokenList.forEach((token) => {
          priceMap[token.symbol] = data[token.id]?.usd || 0;
        });
        setPrices(priceMap);
      } catch (err) {
        console.error("Failed to fetch prices", err);
      }
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    if (!payAmount || isNaN(Number(payAmount))) {
      setReceiveAmount("0.00");
      return;
    }
    const fromPrice = prices[fromToken.symbol];
    const toPrice = prices[toToken.symbol];
    if (fromPrice && toPrice) {
      const usdValue = parseFloat(payAmount) * fromPrice;
      const converted = usdValue / toPrice;
      setReceiveAmount(converted.toFixed(4));
    }
  }, [payAmount, prices, fromToken, toToken]);

  const handleContinue = () => {
    if (!payAmount || !recipient) return;
    setSwapDetails({
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      amount: payAmount,
      recipient,
      recieveAmount: receiveAmount,
    });
    toggleConfirmModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white p-5 font-poppins max-w-md mx-auto relative">
      <button
        className="absolute top-4 left-4 text-white opacity-80 hover:opacity-100 transition"
        onClick={() => router.back()}
      >
        <IoArrowBack size={24} color="#E6B911" />
      </button>
      <h2 className="text-center text-xl font-semibold mb-4">
        Cross Chain Swap
      </h2>

      {/* Pay Section */}
      <div className="bg-[#1B1B1B] p-4 rounded-xl mb-3 relative">
        <label className="text-sm text-gray-400 mb-1 block">Pay</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="0.00"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="bg-transparent text-white w-full text-lg font-semibold focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            step="0.01"
            min="0"
          />
          <button
            onClick={() => setShowFromDropdown(!showFromDropdown)}
            className="bg-[#2B2B2B] px-3 py-1 rounded-lg flex items-center gap-1 relative"
          >
            {fromToken.symbol} <IoChevronDown />
          </button>
        </div>
        {showFromDropdown && (
          <div className="absolute right-0 mt-2 w-32 bg-[#2B2B2B] rounded-lg shadow-lg z-10">
            {tokenList.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  setFromToken(token);
                  setShowFromDropdown(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#3B3B3B]"
              >
                {token.symbol} - {token.chain}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">Source: {fromToken.chain}</p>
      </div>

      {/* Swap icon */}
      <div className="flex justify-center my-2">
        <div className="bg-[#262626] p-2 rounded-full rotate-90 shadow-[0_0_15px_4px_rgba(230,185,17,0.6)] transition duration-300 ease-in-out">
          <FaExchangeAlt className="text-yellow-400" />
        </div>
      </div>

      {/* Receive Section */}
      <div className="bg-[#1B1B1B] p-4 rounded-xl mb-3 relative">
        <label className="text-sm text-gray-400 mb-1 block">Receive</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={receiveAmount}
            readOnly
            className="bg-transparent text-white w-full text-lg font-semibold focus:outline-none"
          />
          <button
            onClick={() => setShowToDropdown(!showToDropdown)}
            className="bg-[#2B2B2B] px-3 py-1 rounded-lg flex items-center gap-1 relative"
          >
            {toToken.symbol} <IoChevronDown />
          </button>
        </div>
        {showToDropdown && (
          <div className="absolute right-0 mt-2 w-32 bg-[#2B2B2B] rounded-lg shadow-lg z-10">
            {tokenList.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  setToToken(token);
                  setShowToDropdown(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#3B3B3B]"
              >
                {token.symbol} - {token.chain}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Destination: {toToken.chain}
        </p>
      </div>

      {/* To Address with Paste */}
      <div className="relative w-full mt-3">
        <input
          type="text"
          placeholder="Enter recipient wallet"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full bg-[#1B1B1B] text-sm text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-16 focus:outline-none"
        />
        <button
          onClick={async () => {
            const text = await navigator.clipboard.readText();
            setRecipient(text);
          }}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-[#E6B911] font-semibold hover:underline"
        >
          Paste
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 mt-4 space-y-1">
        <div className="flex justify-between">
          <span>Fee</span>
          <span>$0.00</span>
        </div>
        <div className="flex justify-between">
          <span>Gas Cost</span>
          <span>~0.001 SOL</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated time</span>
          <span>1-2 mins</span>
        </div>
      </div>

      {/* Continue */}
      <button
        onClick={handleContinue}
        className="mt-6 bg-gradient-to-r from-[#E6B911] to-[#cc920f] w-full py-3 rounded-xl text-black font-semibold hover:opacity-90 transition"
      >
        Continue
      </button>

      <ConfirmModal />
    </div>
  );
};

export default CrossChainSwap;
