"use client";

import { useSwapStore } from "@/stores/useSwapStore";
import { IoCheckmark, IoClose, IoCopy } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/FE/common/Loader";
import Lottie from "lottie-react";
import error from "@/assets/error.json";
import success from "@/assets/success.json";

const ConfirmModal = () => {
  const {
    fromToken,
    toToken,
    amount,
    recipient,
    recieveAmount,
    showConfirmModal,
    toggleConfirmModal,
  } = useSwapStore();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleConfirm = () => {
    setLoading(true);

    setTimeout(() => {
      const randomSuccess = Math.random() > 0.3; // Simulated 70% success rate
      setLoading(false);

      if (randomSuccess) {
        setStatus("success");

        setTimeout(() => {
          toggleConfirmModal(false);
          router.push("/");
        }, 5000);
      } else {
        setStatus("error");
        setTimeout(() => {
          setStatus("idle");
          toggleConfirmModal(false);
        }, 3000);
      }
    }, 3000); // Simulate API delay
  };

  if (!showConfirmModal) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
        <div className="rounded-2xl p-6 w-full max-w-xs flex items-center justify-center gap-4">
          <Loader />
          <p className="text-sm text-gray-300 font-exo2 tracking-wide animate-pulse">
            Processing Transaction...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
        <div className="bg-[#111111] rounded-2xl p-6 text-center max-w-md w-full border border-green-500 shadow-lg">
          <h2 className="text-xl font-semibold text-green-400">Success</h2>

          <div className="w-40 h-40 mx-auto">
            <Lottie animationData={success} loop={false} />
          </div>
          <p className="mt-2 text-sm text-white">Transaction confirmed.</p>
          <p className="mt-1 text-xs text-gray-400">
            Redirecting in 5 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
        <div className="bg-[#111111] rounded-2xl p-6 text-center max-w-md w-full border border-red-500 shadow-lg">
          <h2 className="text-xl font-semibold text-red-400">
            Transaction Failed
          </h2>

          <div className="w-40 h-40 mx-auto">
            <Lottie animationData={error} loop={false} />
          </div>
          <p className="mt-2 text-sm text-white">
            Something went wrong. Try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
      <div className="bg-[#111111] text-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl relative border border-[#333]">
        <h2 className="text-center font-semibold text-lg">
          Swap {amount} {fromToken} To {recieveAmount} {toToken} on {toToken}
        </h2>

        <div className="bg-black rounded-xl p-4 space-y-3 border border-[#1a1a1a]">
          <div>
            <p className="text-sm text-gray-400">Send From</p>
            <p className="text-white text-base">{fromToken}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Amount</p>
            <p className="text-white text-base">
              {amount} {fromToken}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Recipient</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-base truncate">{recipient}</p>
              <button onClick={() => navigator.clipboard.writeText(recipient)}>
                <IoCopy size={16} className="text-gray-300" />
              </button>
            </div>
          </div>

          <div className="border-t border-dashed border-[#E6B911] pt-2 text-center text-xs text-gray-400">
            This address is valid for this transaction only. Expires in:{" "}
            <span className="text-[#E6B911]">23:04</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={handleConfirm}
            className="bg-[#E6B911] text-black px-4 py-2 rounded-xl flex items-center gap-2 font-semibold"
          >
            <IoCheckmark /> Confirm
          </button>
          <button
            onClick={() => toggleConfirmModal(false)}
            className="border border-[#E6B911] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold"
          >
            Cancel <IoClose />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
