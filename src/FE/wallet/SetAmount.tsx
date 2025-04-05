"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWithdrawStore } from "@/stores/useWithdrawStore";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";

const SetAmount: React.FC = () => {
  const { amount, setAmount, selectedWallet } = useWithdrawStore();
  const router = useRouter();

  const [amountInput, setAmountInput] = useState<string>("0.0"); // Now in SOL
  const [solPrice, setSolPrice] = useState<number>(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState(110);

  const handleSetAmount = () => {
    if (amountInput.trim() !== "") {
      setAmount(parseFloat(amountInput));
    }

    router.push("/withdraw/confirm");
  };

  useEffect(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.offsetWidth;
      setInputWidth(Math.max(spanWidth + 20, 110)); // +20 for padding, min 70
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
    <div className="flex items-center justify-center flex-col h-screen bg-[#080808] p-3 relative">
      <Link href={"/withdraw/select-wallet"}>
        <button className="absolute top-4 left-4 text-white opacity-80">
          <IoArrowBack size={24} color="#CC920F" />
        </button>
      </Link>

      <div className="text-center mb-3">
        <p className="text-2xl font-semibold text-white">Amount</p>
      </div>

      <div className="flex flex-col justify-center w-[360px] h-[70vh] relative text-white bg-[#141414] p-4 rounded-lg shadow-lg return">
        {/* Wallet Info */}
        <div className="text-center mt-2 mb-6 text-gray-400 text-sm absolute top-0 right-[39%]">
          To:{" "}
          {selectedWallet
            ? `${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-4)}`
            : "No wallet selected"}
        </div>

        <div className="flex flex-col items-center w-full max-w-md gap-4">
          {/* USD Amount Display */}
          <div className="text-center max-w-[300px]">
            <p className="text-5xl font-semibold text-white w-[300px]">
              ${usdValue.toFixed(2)} <span className="text-sm">USD</span>
            </p>
          </div>

          {/* SOL Icon */}
          <svg
            width="27"
            height="30"
            viewBox="0 0 9 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.460938"
              y="0.640625"
              width="8.42147"
              height="8.42147"
              rx="2.6668"
              fill="#080808"
            />
            <path
              d="M4.97546 5.95286C4.97546 6.0295 4.99532 6.10406 5.03203 6.16527C5.06874 6.22648 5.12031 6.27101 5.17895 6.29214C5.23759 6.31327 5.30011 6.30984 5.35706 6.28238C5.41401 6.25492 5.4623 6.20492 5.49463 6.13993L6.24978 5.19153C6.27586 5.15873 6.29655 5.11981 6.31066 5.07697C6.32477 5.03413 6.33202 4.98822 6.33201 4.94186C6.332 4.8955 6.32472 4.8496 6.31058 4.80677C6.29645 4.76394 6.27574 4.72504 6.24964 4.69227C6.22354 4.6595 6.19256 4.6335 6.15846 4.61578C6.12436 4.59805 6.08782 4.58894 6.05092 4.58895C6.01402 4.58897 5.97748 4.59812 5.9434 4.61587C5.90931 4.63363 5.87834 4.65965 5.85226 4.69244L5.53761 5.08776V2.42327C5.53761 2.32966 5.50801 2.23988 5.45533 2.17369C5.40264 2.1075 5.33119 2.07031 5.25668 2.07031C5.18217 2.07031 5.11071 2.1075 5.05803 2.17369C5.00534 2.23988 4.97574 2.32966 4.97574 2.42327L4.97546 5.95286ZM4.4223 3.83511C4.4223 3.75846 4.40245 3.68391 4.36574 3.6227C4.32903 3.56149 4.27746 3.51695 4.21882 3.49582C4.16018 3.47469 4.09766 3.47812 4.04071 3.50558C3.98376 3.53304 3.93547 3.58305 3.90314 3.64804L3.14827 4.59644C3.12143 4.629 3.10003 4.66794 3.08531 4.71101C3.07058 4.75407 3.06283 4.80038 3.06251 4.84725C3.06219 4.89411 3.06929 4.94059 3.08342 4.98397C3.09755 5.02735 3.11841 5.06676 3.14478 5.0999C3.17116 5.13304 3.20253 5.15924 3.23705 5.17699C3.27158 5.19474 3.30857 5.20367 3.34588 5.20326C3.38318 5.20285 3.42004 5.19312 3.45432 5.17462C3.48859 5.15612 3.51959 5.12923 3.54551 5.09552L3.86043 4.70021V7.36469C3.86043 7.4583 3.89003 7.54808 3.94272 7.61427C3.9954 7.68046 4.06686 7.71765 4.14137 7.71765C4.21588 7.71765 4.28733 7.68046 4.34002 7.61427C4.3927 7.54808 4.4223 7.4583 4.4223 7.36469V3.83511Z"
              fill="url(#paint0_linear_29_542)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_29_542"
                x1="3.15167"
                y1="7.71765"
                x2="7.17741"
                y2="7.03168"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.384219" stopColor="#CC920F" />
                <stop offset="0.934615" stopColor="#E6B911" />
              </linearGradient>
            </defs>
          </svg>

          {/* SOL Input */}
          <div className="flex justify-center">
            <div
              className="relative transition-all duration-200 ease-in-out"
              style={{ width: `${inputWidth}px` }}
            >
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xl pointer-events-none">
                SOL
              </span>
              <input
                ref={inputRef}
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="pl-6 pr-1 py-1 bg-[#080808] text-white text-xl rounded-lg placeholder-white focus:outline-none no-spinner w-full text-center"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <span
                ref={spanRef}
                className="invisible absolute top-0 left-0 whitespace-pre text-xl"
              >
                {amountInput || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleSetAmount}
        className="mt-2 px-4 py-2 bg-[#CC920F] w-full text-black font-semibold rounded-lg transition hover:bg-yellow-400"
      >
        Continue
      </button>
    </div>
  );
};

export default SetAmount;
