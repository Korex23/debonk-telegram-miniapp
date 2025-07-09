import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import bs58 from "bs58";
import * as ed25519 from "ed25519-hd-key";

// Constants
const SOL_CONTRACT = "So11111111111111111111111111111111111111112";
const RPC_HTTPS_URLS = [
  "https://api.mainnet-beta.solana.com",
  "https://rpc.ankr.com/solana",
  "https://solana-api.projectserum.com",
  "https://api.metaplex.solana.com/",
];

// Utility to validate Solana address
export function validateSolAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    console.log(error);

    return false;
  }
}

// Get SOL balance for any public address
export async function getSolBalance(address: string): Promise<number> {
  const connection = new Connection(
    RPC_HTTPS_URLS[Math.floor(Math.random() * RPC_HTTPS_URLS.length)]
  );
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    console.error("Invalid Solana address:", address, error);
    throw new Error(`Invalid Solana address: ${address}`);
  }
}

// Get USD price of SOL
export async function getSolPrice(): Promise<{ solUsdPrice: number }> {
  const url = `https://api.jup.ag/price/v2?ids=${SOL_CONTRACT}`;
  const res = await fetch(url);
  const priceResponse = await res.json();
  const solUsdPrice = Number(priceResponse.data[SOL_CONTRACT].price);
  return { solUsdPrice };
}

// Get price of a token in USD and SOL
export async function getTokenPrice(token: string): Promise<{
  tokenUsdPrice: number;
  tokenSolPrice: number;
}> {
  const url = `https://api.jup.ag/price/v2?ids=${token},${SOL_CONTRACT}`;
  const res = await fetch(url);
  const priceResponse = await res.json();

  const tokenUsdPrice = priceResponse.data[token].price;
  const solUsdPrice = priceResponse.data[SOL_CONTRACT].price;
  const tokenSolPrice = tokenUsdPrice / solUsdPrice;

  return { tokenUsdPrice, tokenSolPrice };
}

export function generateNewSeed(): string {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  return seed.toString("hex");
}

export function solConvertUint8ArrayToBase58(uint8Array: Uint8Array): string {
  return bs58.encode(uint8Array);
}

export function solDeriveChildPrivateKey(seed: string, index: number) {
  const path = `m/44'/501'/0'/0'/${index}'`;
  const derivedSeed = ed25519.derivePath(path, seed).key;
  const keypair = Keypair.fromSeed(derivedSeed);
  return {
    privateKey: keypair.secretKey,
    publicKey: keypair.publicKey.toBase58(),
  };
}

export function solDeriveChildKeypair(seed: string, index: number): Keypair {
  const path = `m/44'/501'/0'/0'/${index}'`;
  const derivedSeed = ed25519.derivePath(path, seed).key;
  return Keypair.fromSeed(derivedSeed);
}

export function solGetPublicKeyFromSeed(seed: string, index: number): string {
  return solDeriveChildPrivateKey(seed, index).publicKey;
}

export function solAddressFromSeed(seed: string, index: number): string {
  return solGetPublicKeyFromSeed(seed, index);
}

export function solAddressFromSeedMultiple(
  seed: string,
  start: number,
  end: number
) {
  const addresses: { address: string; index: number }[] = [];
  for (let i = start; i <= end; i++) {
    addresses.push({
      address: solAddressFromSeed(seed, i),
      index: i,
    });
  }
  return addresses;
}

export function solGetMultiplePublicKeyFromSeed(
  seed: string,
  start: number,
  end: number
): string[] {
  const pubkeys: string[] = [];
  for (let i = start; i <= end; i++) {
    pubkeys.push(solGetPublicKeyFromSeed(seed, i));
  }
  return pubkeys;
}
