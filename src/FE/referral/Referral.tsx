"use client";

import { useUserData } from "../context/user-provider";
import React, { useState } from "react";
import { IoCopyOutline, IoShareSocialOutline } from "react-icons/io5";

const Referral = () => {
  const { referralInfo } = useUserData();
  const referralData = referralInfo?.data;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Debonk!",
          text: `Earn crypto with me on Debonk using my referral link: ${referralData?.referralLink}`,
          url: referralData?.referralLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(referralData?.referralLink || "");
      alert("Referral link copied to clipboard!");
    }
  };

  return (
    <div className="h-[90vh] mb-20">
      <section className="max-w-[390px] h-[83vh] mx-auto w-[98%] rounded-2xl border border-[#CC920F]/50 bg-[#3C3C3C3B] backdrop-blur-2xl shadow-md p-6 text-white font-exo2 space-y-4 relative">
        {/* Earnings Section */}
        <div>
          <div className="space-y-1">
            <p className="text-xs text-neutral-400 font-light">Earnings</p>
            <p className="text-2xl font-semibold text-[#CC920F]">
              {Number(referralData?.profitSummary?.profit ?? 0).toFixed(2)} SOL
            </p>
          </div>

          {/* Referral Counts */}
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <div>
                <p className="text-neutral-400">Direct Referrals</p>
                <p className="font-medium">
                  {referralData?.profitSummary?.referralCountDirect ?? 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div>
                <p className="text-neutral-400">Indirect Referrals</p>
                <p className="font-medium">
                  {referralData?.profitSummary?.referralCountIndirect ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Program Info */}
        <div className="border-t border-[#CC920F]/30 pt-4 space-y-3 text-sm">
          <p className="font-medium text-[#CC920F]">Referral Program</p>
          <p className="text-neutral-300">
            Earn 50% of trading fees through Debonk&apos;s multi-level referral
            system:
          </p>
          <ul className="list-disc list-inside text-neutral-400 space-y-1 pl-4">
            <li>35% for direct referrals</li>
            <li>10% for second-generation referrals</li>
            <li>5% for third-generation referrals</li>
          </ul>
        </div>

        {/* Referral Link Section */}
        <div className="absolute bottom-5 w-[88%]">
          <div className="space-y-1 mb-3">
            <p className="text-sm text-neutral-400">Your referral link:</p>
            <div className="flex items-center gap-2 bg-[#2a2a2a]/80 border border-[#CC920F]/30 rounded-lg p-2">
              <input
                type="text"
                value={referralData?.referralLink || ""}
                readOnly
                className="flex-1 bg-transparent text-sm text-white truncate focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-2 rounded-md hover:bg-[#CC920F]/20 transition-colors"
                aria-label="Copy referral link"
              >
                <IoCopyOutline
                  className={`text-lg ${
                    copied ? "text-[#CC920F]" : "text-neutral-400"
                  }`}
                />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-[#CC920F] text-center">
                Copied to clipboard!
              </p>
            )}
          </div>

          {/* Invite Friend Button */}
          <button
            onClick={handleShare}
            className="w-full py-3 px-4 bg-[#CC920F] hover:bg-[#E3B419] text-black font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <IoShareSocialOutline className="text-lg" />
            Invite a Friend
          </button>
        </div>
      </section>
    </div>
  );
};

export default Referral;
