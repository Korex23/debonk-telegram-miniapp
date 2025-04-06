import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

const DepositPage = dynamic(() => import("@/FE/wallet/Deposit"), {
  loading: () => <Loader />,
});

const Page = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="fixed">
        <DepositPage />
      </div>
    </div>
  );
};

export default Page;
