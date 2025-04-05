"use client";

import { useWithdrawStore } from "@/stores/useWithdrawStore";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "../common/Loader";
import Lottie from "lottie-react";
import success from "@/assets/success.json";
import error from "@/assets/error.json";

const ConfirmDetails: React.FC = () => {
  const { selectedWallet, amount } = useWithdrawStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");
  const router = useRouter();

  const randomizeStatus = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, Math.random() * 1000 + 5000);

    const statusType = Math.random() < 0.5 ? "success" : "error";
    setStatus(statusType);

    setTimeout(() => {
      if (statusType === "success") {
        router.push("/");
      } else {
        router.push("/");
      }
    }, 2000);
  };

  if (loading) {
    <Loader />;
  } else if (status === "success") {
    return (
      <div className="flex flex-col justify-center bg-[#080808] w-full max-w-[360px] text-white p-3">
        <h2 className="text-lg font-bold mb-4">Transaction Successful</h2>
        <Lottie animationData={success} loop={false} />
        <p className="text-sm mt-4">Your transaction was successful!</p>
      </div>
    );
  } else if (status === "error") {
    return (
      <div className="flex flex-col justify-center bg-[#080808] w-full max-w-[360px] text-white p-3">
        <h2 className="text-lg font-bold mb-4">Transaction Failed</h2>
        <Lottie animationData={error} loop={false} />
        <p className="text-sm mt-4">
          Your transaction failed. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center bg-[#080808] w-full max-w-[360px] text-white p-3">
      <h2 className="text-lg font-bold mb-4">Confirm Details</h2>
      <div className="bg-[#141414] p-4 rounded-lg shadow-lg w-full max-w-md">
        <p className="text-sm font-semibold">Wallet Address:</p>
        <p className="text-sm">{selectedWallet}</p>
        <p className="text-sm font-semibold mt-2">Amount:</p>
        <p className="text-sm">{amount} SOL</p>
      </div>

      <button
        onClick={randomizeStatus}
        className="mt-4 px-4 py-2 bg-[#E6B911] w-full text-black rounded-lg cursor-pointer"
      >
        Confirm Transaction
      </button>
    </div>
  );
};
export default ConfirmDetails;
