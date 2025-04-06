import { create } from "zustand";

interface SwapState {
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  showConfirmModal: boolean;
  recieveAmount: string;
}

interface SwapActions {
  setSwapDetails: (details: Omit<SwapState, "showConfirmModal">) => void;
  toggleConfirmModal: (show: boolean) => void;
}

export const useSwapStore = create<SwapState & SwapActions>((set) => ({
  fromToken: "",
  toToken: "",
  amount: "",
  recipient: "",
  showConfirmModal: false,
  recieveAmount: "",

  setSwapDetails: (details) => set((state) => ({ ...state, ...details })),
  toggleConfirmModal: (show) => set(() => ({ showConfirmModal: show })),
}));
