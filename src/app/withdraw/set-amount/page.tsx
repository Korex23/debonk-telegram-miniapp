import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

const SetAmount = dynamic(() => import("@/FE/wallet/SetAmount"), {
  loading: () => <Loader />,
});

const Page = () => {
  return (
    <div className="flex justify-center items-center">
      <SetAmount />
    </div>
  );
};

export default Page;
