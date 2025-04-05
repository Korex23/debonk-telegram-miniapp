"use client";

import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

// Dynamically import ConfirmDetails with SSR disabled
const ConfirmDetails = dynamic(() => import("@/FE/wallet/ConfirmDetails"), {
  ssr: false,
  loading: () => <Loader />,
});

export default function ConfirmPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <ConfirmDetails />
    </div>
  );
}
