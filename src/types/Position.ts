export interface Position {
  name: string; // e.g. "Wrapped SOL"
  tokenSymbol: string; // e.g. "SOL"
  liquidity: number; // e.g. 12819
  amountHeld: number; // e.g. 0.00415
  currentPriceUsd: number; // e.g. 151.52
  pnlUsd: number; // e.g. 0.00402
  pnlSol: number; // e.g. 0.0000265
  pnlPercentage: number; // e.g. 0.64
  pnlColor: string; // e.g. "text-green-400" or "text-red-400"
}
