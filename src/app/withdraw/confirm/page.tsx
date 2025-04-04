"use client";

import { useWithdrawStore } from "@/stores/useWithdrawStore";

export default function ConfirmPage() {
  const { selectedWallet } = useWithdrawStore();

  return (
    <div className="text-white p-6">
      <h1 className="text-xl font-bold">Confirm Withdrawal</h1>
      <p className="mt-4">Selected Wallet: {selectedWallet}</p>
    </div>
  );
}
