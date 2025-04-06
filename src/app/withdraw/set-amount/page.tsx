import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

const SetAmount = dynamic(() => import("@/FE/wallet/SetAmount"), {
  loading: () => <Loader />,
});

const Page = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="fixed">
        <SetAmount />
      </div>
    </div>
  );
};

export default Page;
