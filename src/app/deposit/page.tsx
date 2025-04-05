import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

const DepositPage = dynamic(() => import("@/FE/wallet/Deposit"), {
  loading: () => <Loader />,
});

const Page = () => {
  return (
    <div className="flex justify-center items-center">
      <DepositPage />
    </div>
  );
};

export default Page;
