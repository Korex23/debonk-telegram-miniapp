"use client";

import React, { useState, useEffect } from "react";
import { IoArrowBack, IoCopySharp } from "react-icons/io5";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { generateRandomCryptoAddress } from "@/utils/RandomCryptoAddress";

const DepositPage = () => {
  const [address, setAddress] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

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
    <div className="flex items-center justify-center">
      <div className="bg-[#080808] h-screen w-full max-w-md p-6 fixed text-center shadow-lg relative flex flex-col justify-center transition-all transform">
        {/* Close button */}
        <Link href={"/"}>
          <button className="absolute top-4 left-4 text-white">
            <IoArrowBack size={24} />
          </button>
        </Link>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-6">Deposit</h2>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <QRCodeSVG
            value={address}
            size={160}
            fgColor="#E6B911"
            bgColor="#000000"
          />
        </div>

        {/* Address Info */}
        <p className="text-white text-sm mb-4">Your Debonk Solana Address</p>
        <p className="text-white text-sm mb-4">
          Receive tokens using this address as your deposit address
        </p>

        {/* Address with Copy Button */}
        {isCopied && <span className="text-white ml-2">Copied!</span>}
        <div className="bg-[#E6B911] rounded-lg p-3 mb-6 flex justify-center items-center text-black">
          <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>

          <button className="ml-2" onClick={handleCopyAddress}>
            <IoCopySharp className="text-black" />
          </button>
        </div>

        {/* Share Button */}
        <button
          className="bg-transparent border border-[#E6B911] w-full text-[#E6B911] py-2 px-6 rounded-lg p-3 mb-6"
          onClick={handleShare}
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default DepositPage;
