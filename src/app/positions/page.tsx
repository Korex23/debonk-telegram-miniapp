import React from "react";
import PositionsCard from "@/FE/positions/PositionCard";

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

// This code is a React functional component that renders a main section of a webpage. It uses the PositionsCard component to display positions information. The main section has a background image and some padding, and it is styled with Tailwind CSS classes. The PositionsCard component is imported from another file and is responsible for rendering the actual positions data.
