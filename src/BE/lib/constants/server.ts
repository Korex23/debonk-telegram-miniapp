export const CHAINSTACK_RPC = process.env.CHAIN_STACK_URL!;
export const QUICKNODE_SOL_MAINNET = process.env.QUICK_NODE_URL!;
export const HELIUS_RPC_HTTPS = process.env.HELIUS_RPC_URL!;
export const HELIUS_API_KEY = process.env.HELIUS_API_KEY!;
export const ADMIN_BOT_KEY = process.env.ADMIN_BOT_KEY!;
export const BOT_USERNAME =
  process.env.ENV === "production" ? "debonk_bot" : "debonk_test_bot";
export const DEV_TELEGRAM_ID = 1729044712;

export const RPC_HTTPS_URLS = [
  "https://mainnet.helius-rpc.com/?api-key=9ad9e982-366d-4425-8a91-80c5e68046dc",
];

export interface Validator<T> {
  (value: T): Promise<boolean>;
}

export const ADMIN_KEYBOARD_QUERY = {
  //ADMIN
  ADMIN_UPDATE_USER_PROFIT: "admin_update_user_profit",
};
