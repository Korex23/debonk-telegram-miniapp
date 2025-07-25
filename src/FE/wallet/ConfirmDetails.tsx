"use client";

import Loader from "../common/Loader";
import error from "@/assets/error.json";
import success from "@/assets/success.json";
import { useWithdrawStore } from "@/stores/useWithdrawStore";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

const ConfirmDetails: React.FC = () => {
  const {
    selectedWallet,
    amount,
    amountLamports,
    addToWalletHistory,
    setSucessfull,
  } = useWithdrawStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [countdown, setCountdown] = useState(5);
  const [txHash, setTxHash] = useState<string>("");
  const router = useRouter();

  const handleConfirm = async () => {
    setLoading(true);
    console.log(amount, amountLamports, selectedWallet);

    const startTime = Date.now();

    try {
      // Make the actual withdrawal request
      const res = await fetch("/api/telegram/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: "7023048964",
          amount: amountLamports,
          destination: selectedWallet,
        }),
      });

      if (!res.ok) {
        throw new Error(`Withdrawal failed with status: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);

      // Ensure minimum loading time for better UX (1-2 seconds total)
      const minLoadingTime = 1000;
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setLoading(false);

        if (data.success) {
          setStatus("success");
          setSucessfull();
          addToWalletHistory(selectedWallet);
          setTxHash(data.txId);

          // Success countdown
          let secondsLeft = 5; // Reduced from 5 to 3 for better UX
          setCountdown(secondsLeft);

          const timer = setInterval(() => {
            secondsLeft -= 1;
            setCountdown(secondsLeft);

            if (secondsLeft <= 0) {
              clearInterval(timer);
              router.push("/");
            }
          }, 1000);
        } else {
          setStatus("error");
          router.push("/withdraw");
        }
      }, remainingDelay);
    } catch (error) {
      console.error("Withdrawal error:", error);
      setLoading(false);
      setStatus("error");
      router.push("/withdraw");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-[#080808] min-[370px]:w-[360px] w-[90vw]text-white space-x-4">
        <Loader />

        <p className="text-sm text-gray-400 font-exo2 tracking-wide animate-pulse">
          Processing Transaction...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col justify-center items-center bg-[#080808] min-[370px]:w-[360px] w-[90vw] text-white p-5">
        <div className="bg-[#141414] border border-green-600 rounded-lg p-6 w-full text-center shadow-lg">
          <h2 className="text-xl font-bold text-green-400 mb-3">
            Transaction Successful
          </h2>

          <div className="w-40 h-40 mx-auto">
            <Lottie animationData={success} loop={false} />
          </div>

          <p className="text-sm mt-4 text-white/80">
            Your transaction was successful!
          </p>

          <a
            href={txHash}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#E6B911] underline mt-2 block break-all"
          >
            View on Solscan ↗
          </a>

          <p className="text-xs text-gray-400 mt-2">
            Redirecting to homepage in {countdown} second
            {countdown !== 1 ? "s" : ""}...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col justify-center items-center bg-[#080808] min-[370px]:w-[360px] w-[90vw] text-white p-5">
        <div className="bg-[#141414] border border-red-600 rounded-lg p-6 w-full text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-400 mb-3">
            Transaction Failed
          </h2>

          <div className="w-40 h-40 mx-auto">
            <Lottie animationData={error} loop={false} />
          </div>

          <p className="text-sm mt-4 text-white/80">
            Your transaction failed. Please try again.
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Redirecting to select wallet in {countdown} second
            {countdown !== 1 ? "s" : ""}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-[#080808] min-h-screen max-w-[400px] w-[98%] text-white relative">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 text-white opacity-80 hover:opacity-100 transition"
        onClick={() => router.back()}
      >
        <IoArrowBack size={24} color="#E6B911" />
      </button>

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-6 mt-4 text-center tracking-tight font-poppins">
        Confirm Transaction
      </h2>

      {/* Transaction Card */}
      <div className="bg-[#141414] rounded-2xl shadow-2xl w-full p-6 space-y-5 backdrop-blur-md">
        {/* Wallet Section */}
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-exo2">Recipient Wallet</p>
          <p className="text-sm font-medium break-words font-exo2">
            {selectedWallet}
          </p>
        </div>

        {/* Amount Section */}
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-exo2">Amount</p>
          <p className="text-lg font-semibold text-[#E6B911] font-exo2">
            {amount} SOL
          </p>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        className="mt-8 px-6 py-3 w-full max-w-md text-sm font-bold font-exo2 rounded-xl bg-gradient-to-br from-[#E6B911] to-[#cc920f] text-black hover:opacity-90 active:scale-95 transition-transform duration-150 shadow-md"
      >
        Confirm Transaction
      </button>
    </div>
  );
};

export default ConfirmDetails;
