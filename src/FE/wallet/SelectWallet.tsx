"use client";

import React, { useState } from "react";
import { useWithdrawStore } from "@/stores/useWithdrawStore";
import { useRouter } from "next/navigation";

const SelectWallet: React.FC = () => {
  const { selectedWallet, walletHistory, selectAddress, addToWalletHistory } =
    useWithdrawStore();
  const router = useRouter();

  const [walletInput, setWalletInput] = useState("");

  const handleSelectWallet = () => {
    if (walletInput.trim() !== "") {
      selectAddress(walletInput);

      addToWalletHistory(walletInput);
      console.log("Navigating to /withdraw/confirm");
      router.push("/withdraw/confirm");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808] w-full max-w-[360px] text-white p-3">
      <h2 className="text-lg font-bold mb-4">Select Wallet</h2>

      {/* Wallet Input */}
      <div className="bg-[#141414] p-4 rounded-lg shadow-lg w-full max-w-md">
        <input
          type="text"
          value={selectedWallet ? selectedWallet : walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          className="w-full max-w-md p-2 text-white bg-[#080808] rounded-lg"
          placeholder="Enter wallet address"
        />

        {/* Wallet History */}
        <h3 className="mt-6 text-lg font-semibold">Wallet History</h3>
        <div className="mt-2">
          {walletHistory.length === 0 ? (
            <p className="text-gray-400">No history available</p>
          ) : (
            walletHistory.map((wallet, index) => (
              <button
                key={index}
                onClick={() => setWalletInput(wallet)}
                className="block mt-2 px-4 py-2 bg-[#080808] rounded-lg hover:bg-gray-600 w-full"
              >
                {`${wallet.slice(0, 6)}...${wallet.slice(-4)}`}
              </button>
            ))
          )}
        </div>
      </div>
      <button
        onClick={handleSelectWallet}
        className="mt-4 px-4 py-2 bg-[#E6B911] w-full text-black rounded-lg cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
};

export default SelectWallet;
