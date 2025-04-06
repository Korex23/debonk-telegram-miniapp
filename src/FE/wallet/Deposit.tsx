"use client";

import React, { useState, useEffect } from "react";
import { IoArrowBack, IoCopySharp } from "react-icons/io5";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { generateRandomCryptoAddress } from "@/utils/RandomCryptoAddress";
import { useRouter } from "next/navigation";

const DepositPage = () => {
  const [address, setAddress] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const router = useRouter();

  // Set your Solana deposit address here, for example:
  useEffect(() => {
    // Set a mock address for the example
    setAddress(generateRandomCryptoAddress()); // Replace with actual address fetching logic
  }, []);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Share Wallet Address",
          text: address,
        });
        console.log("Address shared successfully");
      } catch (error) {
        console.error("Error sharing address:", error);
      }
    } else {
      alert("Sharing is not supported in your browser.");
    }
  };

  // Close and redirect (optional)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808] px-4 relative gap-3">
      {/* Back Button */}

      <button
        className="absolute top-4 left-4 text-white hover:opacity-90 transition"
        onClick={() => router.back()}
      >
        <IoArrowBack size={24} color="#E6B911" />
      </button>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">
        Deposit
      </h2>
      <div className="bg-[#141414] w-full max-w-md p-6 rounded-2xl text-center shadow-lg flex flex-col justify-center space-y-5">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-black p-3 rounded-xl border border-[#2c2c2c]">
            <QRCodeSVG
              value={address}
              size={160}
              fgColor="#E6B911"
              bgColor="#000000"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <p className="text-sm text-gray-400 font-exo2">
            Your Debonk Solana Address
          </p>
          <p className="text-xs text-gray-500 font-exo2">
            Receive tokens using this as your deposit address.
          </p>
        </div>

        {/* Address Copy Box */}
        <div className="bg-[#E6B911] rounded-lg px-4 py-3 flex items-center justify-between text-black font-mono">
          <span className="text-[11px]">{address}</span>
          <button onClick={handleCopyAddress}>
            <IoCopySharp className="text-black hover:opacity-70 transition" />
          </button>
        </div>
        {isCopied && (
          <span className="text-green-400 text-sm font-medium animate-pulse">
            Copied!
          </span>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full py-2 rounded-lg border border-[#E6B911] text-[#E6B911] font-semibold transition hover:bg-[#E6B911]/10"
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default DepositPage;
