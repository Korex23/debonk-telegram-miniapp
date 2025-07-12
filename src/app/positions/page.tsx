// app/positions/page.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";

const PositionsCard = dynamic(() => import("@/FE/positions/PositionCard"), {
  ssr: false,
});

const PositionsPage: React.FC = () => {
  return (
    <div className="bg-black min-h-screen p-4">
      <PositionsCard />
    </div>
  );
};

export default PositionsPage;
