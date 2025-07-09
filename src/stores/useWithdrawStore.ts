import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WithdrawStore {
  selectedWallet: string;
  walletHistory: string[];
  amount: number;
  amountLamports: number;
  searchWalletFromHistory: (wallet: string) => void;
  selectAddress: (wallet: string) => void;
  setAmount: (amount: number) => void;
  setSucessfull: () => void;
  addToWalletHistory: (wallet: string) => void;
  successfull: boolean;
}

export const useWithdrawStore = create<WithdrawStore>()(
  persist(
    (set) => ({
      selectedWallet: "",
      walletHistory: [],
      amount: 0,
      amountLamports: 0,
      successfull: false,

      searchWalletFromHistory: (wallet) => {
        set((state) => ({
          walletHistory: state.walletHistory.includes(wallet)
            ? state.walletHistory
            : [...state.walletHistory, wallet],
        }));
      },

      selectAddress: (wallet) => {
        set(() => ({
          selectedWallet: wallet,
        }));
      },

      setSucessfull: () => {
        set(() => ({
          successfull: true,
        }));
      },

      setAmount: (amount) => {
        set(() => ({
          amount,
          amountLamports: amount * LAMPORTS_PER_SOL,
        }));
      },

      addToWalletHistory: (wallet) => {
        set((state) => ({
          walletHistory: state.walletHistory.includes(wallet)
            ? state.walletHistory
            : [...state.walletHistory, wallet],
        }));
      },
    }),
    {
      name: "withdraw-store", // localStorage key
      partialize: (state) => ({
        walletHistory: state.walletHistory, // only persist walletHistory
      }),
    }
  )
);
