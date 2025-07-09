import PositionsCard from "@/FE/positions/PositionCard";
import React from "react";

const PositionsPage: React.FC = () => {
  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-black mt-10">
        <div className="fixed">
          <PositionsCard />
        </div>
      </div>
    </>
  );
};

export default PositionsPage;
