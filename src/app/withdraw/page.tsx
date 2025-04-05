import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

const SelectWallet = dynamic(() => import("@/FE/wallet/SelectWallet"), {
  loading: () => <Loader />,
});

const WithdrawPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <SelectWallet />
    </div>
  );
};

export default WithdrawPage;
