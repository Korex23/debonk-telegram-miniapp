import dynamic from "next/dynamic";
import Loader from "@/FE/common/Loader";

const Confirm = dynamic(() => import("@/FE/wallet/ConfirmDetails"), {
  loading: () => <Loader />,
  ssr: false,
});

const Page = () => {
  return (
    <div className="flex justify-center items-center">
      <Confirm />
    </div>
  );
};

export default Page;
