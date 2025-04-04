import { Position } from "@/types/Position";

export const generateRandomPosition = (): Position => {
  const capital = parseFloat((Math.random() * 5).toFixed(2));
  const value = parseFloat((Math.random() * 5).toFixed(2));

  // Calculate pnl based on value and capital
  const pnl = value - capital;

  // Calculate pnl percentage
  const pnlPercentage = (pnl / capital) * 100;

  // Determine pnlSol (same as pnl for simplicity)
  const pnlSol = pnl;

  // Determine pnlColor based on whether pnl is positive or negative
  const pnlColor = pnl >= 0 ? "text-green-500" : "text-red-500";

  return {
    name: "Hexacat",
    mc: parseFloat((Math.random() * 1000000).toFixed(2)),
    liq: parseFloat((Math.random() * 100).toFixed(2)), // Random liquidity between 0 and 100
    capital: capital,
    value: value,
    pnl: pnl,
    pnlSol: pnlSol,
    pnlPercentage: pnlPercentage,
    pnlColor: pnlColor,
  };
};
