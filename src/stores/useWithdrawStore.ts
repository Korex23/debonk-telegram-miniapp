import { create } from "zustand";

interface WithdrawStore {
  selectedWallet: string;
  walletHistory: string[];
  amount: number;
  searchWalletFromHistory: (wallet: string) => void;
  selectAddress: (wallet: string) => void;
  setAmount: (amount: number) => void;
  addToWalletHistory: (wallet: string) => void;
}

export const useWithdrawStore = create<WithdrawStore>((set) => ({
  selectedWallet: "",
  walletHistory: [
    "0x1234567890abcdef",
    "0xabcdef1234567890",
    "0x9876543210fedcba",
  ], // Pre-populated wallet history
  amount: 0,

  searchWalletFromHistory: (wallet) => {
    set((state) => ({
      walletHistory: state.walletHistory.includes(wallet)
        ? state.walletHistory
        : [...state.walletHistory, wallet], // Avoid duplicates
    }));
  },

  selectAddress: (wallet) => {
    set(() => ({
      selectedWallet: wallet, // Set selected wallet
    }));
  },

  setAmount: (amount) => {
    set(() => ({
      amount: amount, // Update transfer amount
    }));
  },

  addToWalletHistory: (wallet) => {
    set((state) => ({
      walletHistory: state.walletHistory.includes(wallet)
        ? state.walletHistory
        : [...state.walletHistory, wallet], // Add after withdrawal
    }));
  },
}));
