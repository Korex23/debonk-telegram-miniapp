"use client";

import React, { useState, useMemo } from "react";
import { useWithdrawStore } from "@/stores/useWithdrawStore";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const SelectWallet: React.FC = () => {
  const { selectedWallet, walletHistory, selectAddress } = useWithdrawStore();

  const router = useRouter();
  const [walletInput, setWalletInput] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  // const [hasSelected, setHasSelected] = useState<boolean>(false);

  const handleSelectWallet = () => {
    if (walletInput.trim() !== "") {
      selectAddress(walletInput);
      console.log("Navigating to /withdraw/set-amount");
      router.push("/withdraw/set-amount");
    } else if (walletInput.trim() === "") {
      console.log("No wallet selected, please select a wallet.");
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000); // Clear error after 2 seconds
    }
  };

  // Filter walletHistory based on input
  const filteredWallets = useMemo(() => {
    return walletHistory.filter((wallet) =>
      wallet.toLowerCase().includes(walletInput.toLowerCase())
    );
  }, [walletInput, walletHistory]);

  return (
    <div className="flex flex-col items-center justify-center bg-[#080808] w-full max-w-[360px] max-h-screen overflow-y-auto custom-scroll text-white px-4 py-6 relative">
      <button
        className="absolute top-4 left-4 text-white opacity-80 hover:opacity-100"
        onClick={() => router.back()}
      >
        <IoArrowBack size={24} color="#E6B911" />
      </button>
      <h2 className="text-2xl font-semibold my-6 font-poppins tracking-tight">
        Select Wallet
      </h2>

      <div className="bg-[#141414]/70 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-[360px] px-5 py-6 space-y-4">
        {/* Wallet Input */}
        <input
          type="text"
          value={walletInput}
          onChange={(e) => {
            const value = e.target.value;
            setWalletInput(value);
            if (selectedWallet && value.length < selectedWallet.length) {
              selectAddress("");
            }
          }}
          className={`w-full p-3 rounded-lg font-exo2 text-sm placeholder-gray-400 bg-[#1e1e1e] border transition-all duration-300 outline-none ${
            error
              ? "border-red-500 text-red-400 bg-[#2a1a1a]"
              : "border-transparent focus:border-yellow-500"
          }`}
          placeholder="Paste or type wallet address"
        />

        {/* Filtered Suggestions */}
        {walletInput.trim() &&
          !selectedWallet &&
          filteredWallets.length > 0 && (
            <div>
              <div className="bg-[#1e1e1e] rounded-md border border-[#333] divide-y divide-[#2b2b2b] max-h-24 overflow-y-auto custom-scroll">
                {filteredWallets.map((wallet, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setWalletInput(wallet);
                      selectAddress(wallet);
                    }}
                    className="px-2 py-2 hover:bg-[#292929] text-left text-sm font-exo2 transition-colors"
                  >
                    {wallet.slice(0, 6)}...{wallet.slice(-4)}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Wallet History */}
        {walletHistory.length > 0 && (
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Recent Wallets</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 custom-scroll">
              {walletHistory.map((wallet, index) => (
                <button
                  key={index}
                  onClick={() => setWalletInput(wallet)}
                  className="px-4 py-3 bg-[#1a1a1a] hover:bg-[#292929] rounded-md text-left text-sm font-exo2 border border-[#262626] transition"
                >
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </button>
              ))}
            </div>
          </div>
        )}

        {walletHistory.length === 0 && (
          <p className="text-gray-500 text-sm">No wallet history found.</p>
        )}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleSelectWallet}
        className="mt-6 w-full max-w-[360px] py-3 text-sm font-semibold font-exo2 rounded-xl bg-gradient-to-br from-[#E6B911] to-[#cc920f] text-black hover:opacity-90 transition shadow-md cursor-pointer"
      >
        Continue
      </button>

      {/* Error Alert */}
      {error && (
        <div
          className={`fixed bottom-[100px] left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300 ${
            error ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          Please enter a wallet address before continuing.
        </div>
      )}
    </div>
  );
};

export default SelectWallet;
