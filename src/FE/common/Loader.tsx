import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center py-12 h-screen items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC920F]"></div>
    </div>
  );
};

export default Loader;
