export const INITIAL_INLINE_KEYBOARD = [
  [
    { text: "💸 Buy", action: "buy" },
    { text: "💴 Sell", action: "sell" },
  ],
  [{ text: "📝 Positions", action: "positions" }],
  [
    { text: "🤑 Refer & Earn", action: "show_referral_details" },
    { text: "💳 Wallet", action: "show_wallet" },
  ],
  [{ text: "🧪📊 Enter Simulation", action: "enter_simulation" }],
  [{ text: "Chain: SOLANA", action: "bop_all_available_snipping_chains" }],
];

export const BACK_BUTTON = [{ text: "<< Home", action: "back_to_home" }];

export const CANCEL_BUTTON = [{ text: "Cancel", action: "clear_listeners" }];
