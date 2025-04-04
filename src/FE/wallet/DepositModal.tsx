import React, { useEffect } from "react";
import { IoClose, IoCopySharp } from "react-icons/io5";
import { QRCodeSVG } from "qrcode.react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  address,
}) => {
  useEffect(() => {
    // Disable scroll on the body when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function to reset scroll on unmount or when modal is closed
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]); // Dependency on `isOpen` to trigger the effect when modal state changes

  if (!isOpen) return null;

  // Close modal when background is clicked
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Address copied to clipboard!");
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

  const uri = `solana:${address}`;

  return (
    <div
      className="fixed bg-[#080808] flex items-center justify-center z-40 pb-16"
      onClick={handleBackgroundClick}
    >
      <div className="bg-[#080808] border border-[#E6B911] w-full max-w-md p-6 fixed text-center shadow-lg relative rounded-lg flex flex-col justify-center transition-all transform">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 left-4 text-accent">
          <IoClose size={24} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-6">Deposit</h2>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <QRCodeSVG
            value={uri}
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

export default DepositModal;
