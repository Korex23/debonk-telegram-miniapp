import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

const CrossChainSwap = dynamic(() => import("@/FE/swap/CrossChainSwap"), {
  loading: () => <Loader />,
});

const Page = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <CrossChainSwap />
    </div>
  );
};

export default Page;
