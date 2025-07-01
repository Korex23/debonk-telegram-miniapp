export const SOL_PUBLIC_RPC = "https://api.mainnet-beta.solana.com";
export const SOL_DEV_RPC = "https://api.devnet.solana.com";
export const SOL_CONTRACT = "So11111111111111111111111111111111111111112";

export const FEE_TOKEN_ACCOUNT_FOR_WSOL =
  "51h481kJwJaWussDQgBUG9YuvpEwytwxmh9WLps4aJww";
export const DIV = 5;
export const LEAST_AMOUNT_REMAINDER = 0.01;
export const MIN_PROFIT_WITHDRAWAL_AMOUNT = 0.05;

export const REFERRAL_PERCENTS = {
  LEVEL_1: 35,
  LEVEL_2: 10,
  LEVEL_3: 5,
};

export const DEV_SOL_WALLET = "2xwSvyjJoeUWngstxADHrvYwuxhB5XuLfVawYqEUYdGD";

export const YOU_ARE_IN_THE_SIMULATION_TEXT =
  "------------------------- You are in a Simulation NO REAL MONEY IS BEING TRADED -------------------------";

export const PNL_THRESHOLD = 10;

export const STATUS_EMOJI = {
  NEW: "⚪",
  WAITING: "🕔",
  CONFIRMING: "🟠",
  EXCHANGING: "🔄",
  SENDING: "🟢",
  FINISHED: "✅",
  FAILED: "⛔",
  REFUNDED: "💸",
  VERIFYING: "🟡",
};

export const TRANSACTION_STATUS = {
  NEW: "new",
  WAITING: "waiting",
  CONFIRMING: "confirming",
  EXCHANGING: "exchanging",
  SENDING: "sending",
  FINISHED: "finished",
  FAILED: "failed",
  REFUNDED: "refunded",
  VERIFYING: "verifying",
  CANCELLED: "cancelled",
} as const;

export const SOLANA_ERROR_CODES = {
  SLIPPAGE_TOLERANCE_EXCEEDED: "0x1771",
  TIME_STAMP_ERROR: "0x1786",
};

export const APPLICATION_ERROR = {
  JUPITER_SWAP_ERROR: "quote_swap_error",
  TRANSACTION_NOT_CONFIRMED_ERROR: "transaction_not_confirmed",
};

export const ALL_SNIPPER_BOTS = [
  {
    CHAIN: "ECLIPSE",
    USERNAME: "EclipseDebonkBot",
    REFERRAL_ID_FOR_TRACKING: "31",
  },
  {
    CHAIN: "SOLANA",
    USERNAME: "debonk_bot",
    REFERRAL_ID_FOR_TRACKING: "703",
  },
];

export const PNL_LEVELS = {
  PROFIT_HIGH: ["minion.png", "NarutoGAIN.png", "DeadpoolGAIN.png", ""],
  PROFIT_LOW: ["pepe.png", "SpiermanGAIN.png"],
  LOSS_HIGH: ["spidy.png", "DeadpoolLOSS.png"],
  LOSS_LOW: ["sip.png", "NarutoLOSS.png", "SpiermanLOSS2.png"],
};

export const TOKEN_MAP: { [key: string]: string } = {
  eth: "eth",
  ethereum: "eth",
  solana: "sol",
  btc: "btc",
  bitcoin: "btc",
  avax: "cchain",
  avaxc: "cchain",
  polygon: "matic",
  litecoin: "ltc",
  tron: "trx",
  trc20: "trx",
  bsc: "bnb",
};

export const NETWORK_MAP: { [key: string]: string } = {
  /**
   * this is for resolving similar networks and also resolving when the user input the network in a wired way
   */
  eth: "eth",
  ethereum: "eth",
  erc20: "eth",
  bsc: "bsc",
  binance: "bsc",
  binancesmartchain: "bsc",
  solana: "sol",
  bep20: "bsc",
  btc: "btc",
  bitcoin: "btc",
  avax: "cchain",
  avaxc: "cchain",
  polygon: "matic",
  litecoin: "ltc",
  tron: "sol",
  trc20: "sol",
  bnb: "bsc",

  // Add more mappings as needed
};

export const EVM_CHAIN_MAP: { [key: string]: string } = {
  eth: "eth",
  tron: "sol",
  trc20: "sol",
  bep20: "eth",
  ethereum: "eth",
  erc20: "eth",
  bsc: "eth", // Binance Smart Chain
  binance: "eth",
  solana: "sol",
  binancesmartchain: "eth",
  polygon: "eth", // Polygon (formerly Matic)
  matic: "eth",
  avax: "eth", // Avalanche C-Chain
  avalanche: "eth",
  fantom: "eth",
  ftm: "eth", // Fantom Opera
  arbitrum: "eth", // Arbitrum One
  arbitrumone: "eth",
  optimism: "eth",
  op: "eth", // Optimism
  xdai: "eth", // Gnosis Chain (formerly xDai)
  gnosis: "eth",
  heco: "eth", // Huobi ECO Chain
  harmony: "eth", // Harmony One
  one: "eth",
  kcc: "eth", // KuCoin Community Chain
  cronos: "eth", // Crypto.com Cronos Chain
  aurora: "eth", // Aurora (Near's EVM)
  metis: "eth", // Metis Andromeda
  moonbeam: "eth", // Moonbeam (Polkadot)
  moonriver: "eth", // Moonriver (Kusama)
  klaytn: "eth", // Klaytn
  celo: "eth", // Celo
  fuse: "eth", // Fuse Network
  tomochain: "eth", // TomoChain
  okex: "eth", // OKExChain
  okc: "eth", // OKC (OKExChain)
  velas: "eth", // Velas
  syscoin: "eth", // Syscoin NEVM
  telos: "eth", // Telos EVM
  kardia: "eth", // KardiaChain
  meter: "eth", // Meter.io
  milkomeda: "eth", // Milkomeda (Cardano)
  oec: "eth", // OEC (OKExChain)
  boba: "eth", // Boba Network
  bttc: "eth", // BitTorrent Chain
  oasis: "eth", // Oasis Emerald
  theta: "eth", // Theta
  conflux: "eth", // Conflux eSpace
};

export const COULD_NOT_GET_TOKEN_DETAILS_TEXT = `⚠Could not get token details\n\n -Please Make sure you are passing a token Contract Address or the pair address, and not a Wallet Address.\n -You can also Directly paste Links from Dex Screener, Dex Tools, Rug Checker, Bird Eye and others. `;
