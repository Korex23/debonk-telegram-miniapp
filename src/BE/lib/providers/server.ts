import {
  DEV_SOL_WALLET,
  SOL_CONTRACT,
  FEE_TOKEN_ACCOUNT_FOR_WSOL,
  APPLICATION_ERROR,
} from "../constants/client";
import {
  SLippageExceedingError,
  TransactionNotConfirmedError,
  getSwapError,
} from "../errors";
import { creditReferral } from "../referrals/referrals";
import { transactionSenderAndConfirmationWaiter } from "../transactionSender";
import {
  isSellTokenInSolParams,
  isSellTokenParams,
  SellTokenInSolParams,
  SellTokenParams,
  BuyTokenParams,
} from "../types";
import { HELIUS_RPC_HTTPS } from "@/BE/lib/constants/server";
import { RPC_HTTPS_URLS } from "@/BE/lib/constants/server";
import { createJupiterApiClient, QuoteResponse } from "@jup-ag/api";
import * as jup from "@jup-ag/api";
import {
  getAccount,
  getAssociatedTokenAddress,
  Account,
  getMint,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  ComputeBudgetProgram,
  TransactionMessage,
  Transaction,
  VersionedTransaction,
  PublicKeyInitData,
  MessageV0,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import bs58 from "bs58";
import * as ed25519 from "ed25519-hd-key";
import * as fs from "fs";

const jupiterQuoteApi = createJupiterApiClient();

interface IAddress {
  address: string;
  index: number;
}

export interface SolChain {
  name: string;
  chainDecimals: string;
  explorer: string;
  http: string;
  ws: string;
  nativeTokenProfitSpreed: string;
  isEvm: boolean;
}
const seed: string = process.env.BEEN ?? "";
console.log("HELIUS_RPC_HTTPS: ", HELIUS_RPC_HTTPS);
const chain: SolChain = {
  name: "sol",
  chainDecimals: LAMPORTS_PER_SOL.toString(),
  explorer: "https://solscan.io",
  http: HELIUS_RPC_HTTPS || "https://api.mainnet-beta.solana.com",
  ws: "",
  nativeTokenProfitSpreed: "0.04",
  isEvm: false,
};
interface AddressWithIndex {
  address: string;
  index: number;
}

export class MasterSolSmartWalletClass {
  // Define the type for the config object
  chain: SolChain;
  connection: Connection;
  masterKeyPair: { privateKey: Uint8Array; publicKey: string };
  isDevnet: boolean = false;
  seed: string;

  constructor() {
    console.log("HELIUS_RPC_HTTPS: ", HELIUS_RPC_HTTPS);
    this.seed = seed;
    this.chain = chain;
    this.connection = new Connection(chain.http, "confirmed");
    this.masterKeyPair = this.solDeriveChildPrivateKey(0);
  }
  static validateSolAddress(address: string) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  static async createSendConfirmRetryDeserializedTransaction(
    deserializedBuffer: Buffer,
    senderKeypairs: Keypair[],
    connection: Connection,
    latestBlockhash: Readonly<{
      blockhash: string;
      lastValidBlockHeight: number;
    }>,
    isDevnet: boolean
  ) {
    const transaction = VersionedTransaction.deserialize(deserializedBuffer);

    // ✅ Patch the blockhash before signing
    transaction.message.recentBlockhash = latestBlockhash.blockhash;

    // ✅ Sign with the actual keypair
    transaction.sign(senderKeypairs);

    const signature = bs58.encode(transaction.signatures[0]);
    const explorerUrl = isDevnet
      ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      : `https://solscan.io/tx/${signature}`;

    console.log("Simulating transaction...");

    const simulation = await connection.simulateTransaction(transaction, {
      commitment: "processed",
    });

    if (simulation.value.err) {
      console.error("❌ Simulation error:", simulation.value.err);
      console.log("🧪 Simulation logs:");
      console.dir(simulation.value.logs, { depth: null });

      return {
        status: false,
        error: simulation.value.err,
        logs: simulation.value.logs,
      };
    }

    console.log("✅ Simulation passed, sending transaction...");

    const serialized = transaction.serialize();
    const txid = await connection.sendRawTransaction(serialized, {
      skipPreflight: false,
      preflightCommitment: "processed",
    });

    console.log("⏳ Waiting for confirmation...");

    const confirmation = await connection.confirmTransaction(
      {
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );

    if (confirmation?.value?.err) {
      console.error("❌ Transaction failed:", confirmation.value.err);
      throw new TransactionNotConfirmedError({
        reason: confirmation.value.err.toString(),
      });
    }

    console.log("✅ Transaction confirmed.");
    console.log("🔗 Explorer:", explorerUrl);

    return { status: true, explorerUrl, txHash: txid };
  }

  async _solSendTransaction(
    recipientAddress: string,
    amount: number,
    senderSecretKey: Uint8Array
  ) {
    /**
     * internal method for sending sol transaction
     */
    const connection = this.connection;
    const senderKeypair = Keypair.fromSecretKey(senderSecretKey);

    try {
      new PublicKey(recipientAddress);
    } catch (error) {
      console.log(
        "the recipientAddress is not a valid public key",
        recipientAddress
      );
      throw new Error(String(error));
    }

    const senderBalance = await connection.getBalance(senderKeypair.publicKey);
    console.log("senderBalance: ", senderBalance);

    if (senderBalance < amount * LAMPORTS_PER_SOL) {
      console.log(
        "insufficient funds: sender balance is less than the amount to send"
      );
      throw new Error(
        "insufficient funds: sender balance is less than the amount to send"
      );
    }
    const amountPlusFees = amount * LAMPORTS_PER_SOL + 20045;

    if (senderBalance < amountPlusFees) {
      console.log(
        "insufficient funds + gass : sender balance is less than the amount  Plus gass to send"
      );
      throw new Error(
        "insufficient funds + gass : sender balance is less than the amount  Plus gass to send"
      );
    }
    // request a specific compute unit budget
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1500,
    });

    // set the desired priority fee
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 30000,
    });
    const instructions: TransactionInstruction[] = [
      addPriorityFee,
      modifyComputeUnits,
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: LAMPORTS_PER_SOL * amount,
      }),
    ];

    const latestBlockhash = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: senderKeypair.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message();

    return await this.createSendConfirmRetryTransaction(
      messageV0,
      [senderKeypair],
      connection,
      latestBlockhash,
      this.isDevnet,
      senderKeypair,
      instructions
    );
  }
  async solSendTransaction(recipientAddress: string, amount: number) {
    /**
     * master wallet sends a transaction to @param recipientAddress of @param amount
     */
    const masterKeyPair = this.masterKeyPair.privateKey;
    return await this._solSendTransaction(
      recipientAddress,
      amount,
      masterKeyPair
    );
  }

  async getAddressThatHasBalnce(
    addresses: AddressWithIndex[],
    connection: Connection
  ): Promise<AddressWithIndex[]> {
    const rentExemptionThreshold =
      await connection.getMinimumBalanceForRentExemption(0);
    const addressThatHasBalnce: AddressWithIndex[] = [];
    for (const address of addresses) {
      const senderBalance = await connection.getBalance(
        new PublicKey(address.address)
      );

      if (senderBalance > rentExemptionThreshold) {
        addressThatHasBalnce.push(address);
      }
    }
    return addressThatHasBalnce;
  }

  async solSweepBatchTransaction(
    masterKeys: {
      privateKey: Uint8Array;
      publicKey: string;
    },
    sendersPrivateKeys: Uint8Array[]
  ) {
    const connection: Connection = this.connection;

    let recipientPublicKey: PublicKey;
    try {
      recipientPublicKey = new PublicKey(masterKeys.publicKey);
    } catch (error) {
      console.error(
        "The recipient address is not a valid public key:",
        masterKeys.publicKey
      );
      throw new Error(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : String(error)
      );
    }

    const senderKeypairs: Keypair[] = [];

    for (const senderPrivateKey of sendersPrivateKeys) {
      const senderKeypair = Keypair.fromSecretKey(senderPrivateKey);
      senderKeypairs.push(senderKeypair);
    }

    // const GAS_FEE = 5000; // Adjusted gas fee  5005000
    const rentExemptionThreshold =
      await connection.getMinimumBalanceForRentExemption(0);

    // Request a specific compute unit budget
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1500,
    });
    // Set the desired priority fee
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 30000, // Adjusted priority fee 10000000000
    });

    const initialInstructions: TransactionInstruction[] = [
      modifyComputeUnits,
      addPriorityFee,
    ];

    for (const senderKeypair of senderKeypairs) {
      const senderBalance = await connection.getBalance(
        senderKeypair.publicKey
      );
      const amountToSend = senderBalance - rentExemptionThreshold;

      if (amountToSend > 0) {
        const transferInstruction: TransactionInstruction =
          SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: recipientPublicKey,
            lamports: amountToSend,
          });
        initialInstructions.push(transferInstruction);
      } else {
        console.log(
          `Skipping ${senderKeypair.publicKey.toBase58()} due to insufficient funds after rent exemption`
        );
      }
    }

    if (initialInstructions.length === 2) {
      throw new Error(
        "No valid transfer instructions. Ensure senders have sufficient balances."
      );
    }

    let latestBlockhash = await connection.getLatestBlockhash();

    const masterKeypair = Keypair.fromSecretKey(masterKeys.privateKey);
    senderKeypairs.push(masterKeypair);

    const messageV0 = new TransactionMessage({
      payerKey: masterKeypair.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: initialInstructions,
    }).compileToV0Message();

    //create, send, confirm,retry a new trasaction
    await this.createSendConfirmRetryTransaction(
      messageV0,
      senderKeypairs,
      connection,
      latestBlockhash,
      this.isDevnet,
      masterKeypair,
      initialInstructions
    );
  }
  async solWithdrawBackToMaster(addresses: IAddress[]) {
    /**
     * @param addresses this is the list of All addresses that exist
     */

    let addressThatHasBalance;
    try {
      addressThatHasBalance = await this.getAddressThatHasBalnce(
        addresses,
        this.connection
      );
      console.log("addressThatHasBalance: ", addressThatHasBalance);
    } catch (error) {
      console.log("error:getAddressThatHasBalnce ", error);
    }
    try {
      const privateKeysOfAddressThatHasBalance =
        this.solGetPrivateKeyFromAddressArray(addressThatHasBalance ?? []);
      this.solSweepBatchTransaction(
        this.masterKeyPair,
        privateKeysOfAddressThatHasBalance
      );
    } catch (error) {
      console.log(
        "error:solGetPrivateKeyFromAddressArray orsolSweepBatchTransaction  ",
        error
      );
    }
  }
  async solWithdrawBackToAddress(
    addresses: IAddress[],
    address: string
  ): Promise<void> {
    /**
     * @param addresses this is the list of All addresses that exist
     */

    let addr: PublicKey | undefined;
    try {
      addr = new PublicKey(address);
    } catch (error) {
      console.log("error: not a valid address ", error);
    }
    let addressThatHasBalance: IAddress[] | undefined;
    try {
      addressThatHasBalance = await this.getAddressThatHasBalnce(
        addresses,
        this.connection
      );
      console.log("addressThatHasBalance: ", addressThatHasBalance);
    } catch (error) {
      console.log("error:getAddressThatHasBalnce ", error);
    }
    try {
      const privateKeysOfAddressThatHasBalance =
        this.solGetPrivateKeyFromAddressArray(addressThatHasBalance ?? []);
      if (!addr) {
        throw new Error("Invalid address provided to solWithdrawBackToAddress");
      }
      // Derive the private key for the given address
      const index = addresses.find((a) => a.address === addr.toBase58())?.index;
      if (index === undefined) {
        throw new Error("Address index not found for provided address");
      }
      const masterKey = this.solDeriveChildPrivateKey(index);
      this.solSweepBatchTransaction(
        masterKey,
        privateKeysOfAddressThatHasBalance
      );
    } catch (error) {
      console.log(
        "error:solGetPrivateKeyFromAddressArray orsolSweepBatchTransaction  ",
        error
      );
    }
  }

  async createSendConfirmRetryTransaction(
    messageV0: MessageV0,
    senderKeypairs: Keypair[],
    connection: Connection,
    latestBlockhash: Readonly<{
      blockhash: string;
      lastValidBlockHeight: number;
    }>,
    isDevnet: Boolean,
    feePayerKeypair: Keypair,
    initialInstructions: TransactionInstruction[]
  ) {
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign(senderKeypairs);
    let signature;
    let retries = 5;
    let explorerUrl = "";

    while (retries > 0) {
      try {
        console.log("sending transaction...");
        signature = await connection.sendTransaction(transaction, {
          maxRetries: 3,
        });

        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          console.error("An error occurred:", confirmation.value.err);
        } else {
          explorerUrl = isDevnet
            ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
            : `https://solscan.io/tx/${signature}`;
          console.log("View transaction on explorer:", explorerUrl);
        }
        return { explorerUrl };
        break; // If successful, exit the loop
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string" &&
          (error as { message: string }).message.includes(
            "block height exceeded"
          )
        ) {
          retries -= 1;
          if (retries === 0) {
            console.error(
              "Failed to send transaction after multiple retries due to TransactionExpiredBlockheightExceededError:",
              error
            );
            throw error;
          } else {
            console.log(
              "Retrying transaction due to TransactionExpiredBlockheightExceededError: block height exceeded ..."
            );
            // Update latestBlockhash for retry
            latestBlockhash = await connection.getLatestBlockhash();
            const newMessageV0 = new TransactionMessage({
              payerKey: feePayerKeypair.publicKey,
              recentBlockhash: latestBlockhash.blockhash,
              instructions: initialInstructions,
            }).compileToV0Message();
            transaction.signatures = [];
            transaction.message = newMessageV0;
            transaction.sign(senderKeypairs);
          }
        } else {
          console.error("Failed to send transaction:", error);
          throw error;
        }
      }
    }
  }

  async solSweepBatchTransactionV2(
    recipientAddress: PublicKeyInitData,
    sendersPrivateKeys: Uint8Array[]
  ) {
    const connection: Connection = this.connection;

    try {
      new PublicKey(recipientAddress);
    } catch (error) {
      console.log(
        "the recipientAddress is not a valid public key",
        recipientAddress
      );
      throw new Error(String(error));
    }
    // const senderListLeyPair = [];

    const GAS_FEE = 5005000;
    // request a specific compute unit budget
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500,
    });

    // set the desired priority fee
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 10000000000,
    });

    const transaction = new Transaction()
      .add(addPriorityFee)
      .add(modifyComputeUnits);
    const AllSenderArrayKeypair = [];
    console.log("got heereee1");
    for (const sender of sendersPrivateKeys) {
      const senderArrayKeypair = Keypair.fromSecretKey(sender);
      AllSenderArrayKeypair.push(senderArrayKeypair);
      const senderBalance = await connection.getBalance(
        new PublicKey(senderArrayKeypair.publicKey)
      );

      const amountToSend = senderBalance - GAS_FEE;
      console.log("amountToSend: ", amountToSend);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderArrayKeypair.publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: amountToSend,
        })
      );
    }
    console.log("got heereee2");
    const estimatedfees = await transaction.getEstimatedFee(connection);
    console.log("estimatedfees: ", estimatedfees);
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // Sign transaction, broadcast, and confirm
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      AllSenderArrayKeypair,
      {
        maxRetries: 5,
      }
    );
    console.log("SIGNATURE", signature);

    if (this.isDevnet) {
      console.log(
        "View tx on explorer:",
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
    } else {
      console.log("View tx on explorer:", `https://solscan.io/tx/${signature}`);
    }
  }
  solLoadAddresses(): IAddress[] {
    const addresses: IAddress[] = JSON.parse(
      fs.readFileSync(`Addresses-${this.solAddressFromSeed(0)}.json`, "utf8")
    );
    return addresses;
  }
  solGetMasterAddress(): string {
    return this.solAddressFromSeed(0);
  }
  solGetPrivateKeyFromAddressArray(AddressArray: IAddress[]) {
    const privateKeys = AddressArray.map((address: IAddress) => {
      const privateKey = this.solgetPrivateKeyFromSeed(address.index);
      return privateKey;
    });

    return privateKeys;
  }
  solCreateAddressAndAddToFIle(start: number, end: number) {
    const result = this.solAddressFromSeedMultiple(start, end);
    console.log("getMultiplePublicKeyFromSeed", result);
    fs.writeFileSync(
      `Addresses-${this.solAddressFromSeed(0)}.json`,
      JSON.stringify(result)
    );
  }

  //HELPERS
  solGetMultiplePublicKeyFromSeed(start: number, end: number) {
    const pubkeys: string[] = [];
    for (let i = start; i <= end; i++) {
      const publicKey = this.solGetPublicKeyFromSeed(i);
      pubkeys.push(publicKey);
    }
    return pubkeys;
  }
  solAddressFromSeedMultiple(start: number, end: number) {
    const addresses: IAddress[] = [];
    for (let i = start; i <= end; i++) {
      const _address = this.solAddressFromSeed(i);
      const address = {
        address: _address,
        index: i,
      };
      addresses.push(address);
    }
    return addresses;
  }
  solAddressFromSeed(index: number) {
    //address is same as public key
    return this.solGetPublicKeyFromSeed(index);
  }
  solGetPublicKeyFromSeed(index: number) {
    const keyPair = this.solDeriveChildPrivateKey(index);
    return keyPair.publicKey;
  }
  solgetPrivateKeyFromSeed(index: number) {
    const keyPair = this.solDeriveChildPrivateKey(index);
    return keyPair.privateKey;
  }
  GenerateNewSeed() {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const seedString = seed.toString("hex");
    console.log("seedString: ", seedString);
    return seedString;
  }
  solGetKeyPairFromSeed() {
    const restoredSeedBuffer = Buffer.from(this.seed, "hex").slice(0, 32);
    const seedPhraseKeypair = Keypair.fromSeed(restoredSeedBuffer);
    return seedPhraseKeypair;
  }
  solDeriveChildPrivateKey(index: number) {
    const path = `m/44'/501'/0'/0'/${index}'`;
    // Derive a seed from the given path

    const derivedSeed = ed25519.derivePath(path, this.seed).key;
    const derivedKeyPair = Keypair.fromSeed(derivedSeed);
    const privateKey = derivedKeyPair.secretKey;
    const publicKey = derivedKeyPair.publicKey.toBase58();
    return { privateKey, publicKey };
  }
  solDeriveChildKeypair(index: number) {
    const path = `m/44'/501'/0'/0'/${index}'`;
    // Derive a seed from the given path
    const derivedSeed = ed25519.derivePath(path, this.seed).key;
    const derivedKeyPair = Keypair.fromSeed(derivedSeed);
    return derivedKeyPair;
  }
  solConvertUint8ArrayToBase58(uint8Array: Uint8Array) {
    const base58String = bs58.encode(uint8Array);
    return base58String;
  }
}

export class UserSolSmartWalletClass {
  userAddress: string;
  connection: Connection;
  constructor(private keyPair: Keypair) {
    this.keyPair = keyPair;
    try {
      const address = this.keyPair.publicKey.toBase58();
      if (!UserSolSmartWalletClass.validateSolAddress(address)) {
        throw new Error(`invalid private key`);
      } else {
        this.userAddress = address;
      }
    } catch (error) {
      console.log("error: ", error);
      throw new Error(`invalid private keyPair`);
    }
    const nn = Math.floor(Math.random() * RPC_HTTPS_URLS.length);
    console.log("RPC_HTTPS_URLS[nn]: ", RPC_HTTPS_URLS[nn]);
    this.connection = new Connection(RPC_HTTPS_URLS[nn]);
  }

  static validateSolAddress(address: string) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  static getSolBalance = async (address: string) => {
    const connection = new Connection(HELIUS_RPC_HTTPS);

    let publicKey: PublicKey;

    try {
      publicKey = new PublicKey(address); // this will throw if invalid
    } catch (e) {
      console.log(e);

      throw new Error(
        `The address passed is not a valid Solana address: ${address}`
      );
    }

    try {
      const balance = await connection.getBalance(publicKey);
      return balance;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = error?.message || "";

        console.error("Failed to fetch balance:", message);

        if (message.includes("401") || message.includes("Unauthorized")) {
          throw new Error(
            "Unauthorized access to Solana RPC. Check your API key or RPC config."
          );
        }

        throw new Error(`Unknown error while fetching balance: ${message}`);
      }
    }
  };

  static getTokenPrice = async (token: string) => {
    const url = `https://lite-api.jup.ag/price/v2?ids=${token},${SOL_CONTRACT}`;
    const priceResponse = await (await fetch(url)).json();
    console.log("priceResponse: ", priceResponse);
    const tokenUsdPrice = priceResponse.data[token].price;
    const solUsdPrice = priceResponse.data[SOL_CONTRACT].price;
    const tokenSolPrice = tokenUsdPrice / solUsdPrice;
    return { tokenUsdPrice, tokenSolPrice };
  };
  static getSolPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        {
          cache: "no-store", // Optional: avoid cached stale responses
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const json = await res.json();

      const solUsdPrice = json?.solana?.usd;

      if (!solUsdPrice || typeof solUsdPrice !== "number") {
        console.error("Invalid response shape:", JSON.stringify(json, null, 2));
        throw new Error("Invalid SOL price data from Coingecko");
      }

      return { solUsdPrice };
    } catch (err) {
      console.error("getSolPrice error (fallback):", err);
      throw new Error("Failed to fetch SOL price.");
    }
  };

  getTokenPrice = async (token: string) => {
    return UserSolSmartWalletClass.getTokenPrice(token);
  };

  getUserSolBalance = async () => {
    return await this.connection.getBalance(this.keyPair.publicKey);
  };

  _swap = async (
    token: string,
    amount: number,
    type: "BUY" | "SELL",
    slippage = 0.5
  ) => {
    const swapSlippage = slippage * 100;
    console.log("swapSlippage: ", swapSlippage);
    let quote: jup.QuoteResponse | undefined;
    try {
      if (type === "BUY") {
        const amountLamports = amount * LAMPORTS_PER_SOL;
        console.log("amountLamports: ", amountLamports);

        quote = await jupiterQuoteApi.quoteGet({
          inputMint: "So11111111111111111111111111111111111111112",
          outputMint: token,
          amount: Math.floor(amountLamports),
          platformFeeBps: 5,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
          swapMode: "ExactIn",
          slippageBps: Math.floor(slippage * 100),
        });
      } else if (type === "SELL") {
        const mintInfo = await getMint(this.connection, new PublicKey(token));
        const decimals = mintInfo.decimals;
        console.log("decimals:", decimals);

        const amountLamports = amount * 10 ** decimals;
        console.log("amountLamports:", amountLamports);

        quote = await jupiterQuoteApi.quoteGet({
          outputMint: "So11111111111111111111111111111111111111112",
          inputMint: token,
          amount: Math.floor(amountLamports),
          platformFeeBps: 5,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
          swapMode: "ExactIn",
          slippageBps: Math.floor(slippage * 100) || 50, // Default to 0.5% if slippage is undefined
        });
      } else {
        throw new Error(`Invalid swap type: ${type}`);
      }
    } catch (error) {
      console.log("error: ", error);
      throw new Error(APPLICATION_ERROR.JUPITER_SWAP_ERROR);
    }

    if (!quote) {
      throw new Error("Failed to get quote for swap.");
    }

    const wallet = {
      publicKey: this.keyPair.publicKey,
      payer: this.keyPair, // Add the required payer property
      signTransaction: async (tx: Transaction) => {
        tx.partialSign(this.keyPair);
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        return txs.map((tx) => {
          tx.partialSign(this.keyPair);
          return tx;
        });
      },
    };
    const quoteResponse = await this.getSwapObj(wallet, quote);

    console.log(
      "quoteResponse.swapTransaction: ",
      quoteResponse.swapTransaction
    );
    const swapTransactionBuf = Buffer.from(
      quoteResponse.swapTransaction,
      "base64"
    );
    const latestBlockhash = await this.connection.getLatestBlockhash();

    const { explorerUrl, status, error } =
      await MasterSolSmartWalletClass.createSendConfirmRetryDeserializedTransaction(
        swapTransactionBuf,
        [this.keyPair],
        this.connection,
        latestBlockhash,
        false
      );

    this.connection.getBalance(this.keyPair.publicKey).then((balance) => {
      console.log("balance: ", (balance / LAMPORTS_PER_SOL).toFixed(9));
    });
    if (!status) {
      //check what type of error it is
      const error_ = await getSwapError(error);

      throw error_;
    }
    return explorerUrl;
  };
  getSwapObj = async (
    wallet: { publicKey: PublicKey },
    quote: QuoteResponse
    // token?: string
  ) => {
    const swapObj = await jupiterQuoteApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toBase58(),
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: undefined,
        feeAccount: FEE_TOKEN_ACCOUNT_FOR_WSOL,
      },
    });
    return swapObj;
  };

  buy = async (params: BuyTokenParams) => {
    let status = false;
    let result: unknown;
    try {
      result = await this._swap(
        params.token,
        params.amountInSol,
        "BUY",
        params.slippage
      );
      status = true;
    } catch (error) {
      if (error instanceof TransactionNotConfirmedError) {
        result = await this._swap(
          params.token,
          params.amountInSol,
          "BUY",
          params.slippage
        );
      }

      if (error instanceof SLippageExceedingError) {
        throw error;
      }
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string" &&
        (error as { message: string }).message ===
          APPLICATION_ERROR.JUPITER_SWAP_ERROR
      ) {
        throw error;
      }
      console.log("error: ", error);
      status = false;
    }
    return { result, status };
  };

  sell = async (params: SellTokenParams | SellTokenInSolParams) => {
    let amountToSell;
    let status = false;
    let result: unknown;
    let feesAmount = 0;
    const maxRetry = 3;
    const DEFAULT_SLIPPAGE = 0.5; // default slippage in %

    try {
      const { tokenUsdPrice, tokenSolPrice } = await this.getTokenPrice(
        params.token
      );

      if (isSellTokenParams(params)) {
        if (
          params.percentToSell === undefined ||
          params.percentToSell < 1 ||
          params.percentToSell > 100
        ) {
          throw new Error("params.percentToSell must be between 1 and 100.");
        }

        const balance = await this.getTokenBalance(params.token);
        console.log("balance: ", balance);
        if (!balance || balance < 1) {
          throw new Error("Insufficient balance.");
        }

        amountToSell = Number(
          (balance * (params.percentToSell / 100)).toFixed(6)
        );
        feesAmount = tokenSolPrice * amountToSell * 0.01; // 1% fee in SOL
      } else if (isSellTokenInSolParams(params)) {
        console.log("tokenSolPrice: ", tokenSolPrice);
        console.log("priceOfToken: ", tokenUsdPrice);

        amountToSell = Number(
          (Number(params.amountToSellInSol) / tokenSolPrice).toFixed(6)
        );
        feesAmount = Math.round(
          Number(params.amountToSellInSol) * 0.01 * LAMPORTS_PER_SOL
        );
      } else {
        throw new Error("Invalid params.");
      }

      console.log("amountToSell: ", amountToSell);

      const slippage = params.slippage ?? DEFAULT_SLIPPAGE;
      let retries = 0;

      while (!status && retries < maxRetry) {
        try {
          result = await this._swap(
            params.token,
            amountToSell,
            "SELL",
            slippage
          );
          status = true;
        } catch (error) {
          if (error instanceof TransactionNotConfirmedError) {
            retries++;
            console.warn(`Retrying transaction... attempt ${retries}`);
            continue;
          } else {
            throw error;
          }
        }
      }

      if (!status) {
        throw new Error("Failed to complete transaction after retries.");
      }

      console.log("feesAmount: ", feesAmount);

      await new Promise((resolve) =>
        setTimeout(async () => {
          try {
            const feeResult = await this.withdrawSol(
              feesAmount,
              "7dRnmuCEYJWbApdZCAvXabxJnA54zbSjMiewV8Hk95ax"
            );
            console.log("Fees Deducted Successfully: ", feeResult);

            if (feeResult) {
              const referralResult = await creditReferral(
                this.userAddress,
                feesAmount
              );
              console.log("Referral Credited Successfully: ", referralResult);
            }

            resolve(true);
          } catch (err) {
            console.error(
              "Error during fee deduction or referral credit:",
              err
            );
            resolve(false);
          }
        }, 10000)
      );
    } catch (error) {
      if (error instanceof SLippageExceedingError) {
        throw error;
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string" &&
        (error as { message: string }).message ===
          APPLICATION_ERROR.JUPITER_SWAP_ERROR
      ) {
        throw error;
      }

      console.error("error: ", error);
    }

    return { status, result, amountToSell };
  };

  getTokenBalance = async (token: string) => {
    try {
      // Get the balance from the token account
      const tokenAccount = await this.getTokenAccountAccount(token);
      console.log("token: ", token);
      const tokenBalance = await this.connection.getTokenAccountBalance(
        tokenAccount.address
      );

      console.log(`User Token Balance: ${tokenBalance.value.uiAmount}`);
      //convert tokenBalance bigInt to decimal

      const tokenBalanceDecimal = tokenBalance.value.uiAmount;
      console.log("tokenBalanceDecimal: ", tokenBalanceDecimal);
      return tokenBalanceDecimal;
    } catch (error) {
      console.log(error);

      return 0;
    }
  };
  withdrawSol = async (lamports: number, destination: string) => {
    if (!UserSolSmartWalletClass.validateSolAddress(destination)) {
      throw new Error(`The destination address is not valid: ${destination}`);
    }

    const connection = new Connection(HELIUS_RPC_HTTPS, "confirmed");
    const senderPublicKey = this.keyPair.publicKey;

    const senderBalance = await connection.getBalance(senderPublicKey);
    const feeBuffer = 5000; // small buffer
    const totalNeeded = lamports + feeBuffer;

    if (senderBalance < totalNeeded) {
      throw new Error(
        `Insufficient funds: balance is ${senderBalance} lamports, but ${totalNeeded} lamports required (amount + fee).`
      );
    }

    const destinationPubkey = new PublicKey(destination);
    const recipientInfo = await connection.getAccountInfo(destinationPubkey);
    console.log(recipientInfo);
    const recipientIsNew = !recipientInfo; // ✅ fixed here
    console.log(recipientIsNew);

    const rentExemptionMinimum =
      await connection.getMinimumBalanceForRentExemption(0); // can be fetched dynamically if needed

    if (recipientIsNew && lamports < rentExemptionMinimum) {
      throw new Error(
        `Recipient account does not exist. To create it, you must send at least ${rentExemptionMinimum} lamports.`
      );
    }

    const { explorerUrl } = await this._solSendTransaction(
      destination,
      lamports,
      this.keyPair.secretKey
    );

    return explorerUrl;
  };

  getTokenAccountAccount = async (token: string): Promise<Account> => {
    try {
      // Create PublicKey objects for user and token mint
      const userPublicKeyObj = new PublicKey(this.userAddress);
      const tokenMintAddressObj = new PublicKey(token);

      // Get the associated token account address for the user and the token mint
      const associatedTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddressObj, // The token mint address
        userPublicKeyObj // The user's public key
      );

      // Fetch the token account information
      const tokenAccount = await getAccount(
        this.connection,
        associatedTokenAccount
      );

      return tokenAccount;
    } catch (error) {
      console.error("Error getting token balance:", error);
      throw new Error("Failed to get token account: " + error);
    }
  };

  async _solSendTransaction(
    recipientAddress: string,
    lamportsToSend: number,
    senderSecretKey: Uint8Array
  ) {
    const connection = this.connection;
    const senderKeypair = Keypair.fromSecretKey(senderSecretKey);
    const recipientPubkey = new PublicKey(recipientAddress);

    try {
      recipientPubkey.toBase58(); // Validate address
    } catch (error) {
      console.log(error);

      throw new Error(`❌ Invalid recipient address: ${recipientAddress}`);
    }

    const senderBalance = await connection.getBalance(senderKeypair.publicKey);
    const estimatedFee = 20000;
    const rentExemptionMin = await connection.getMinimumBalanceForRentExemption(
      0
    );
    const recipientInfo = await connection.getAccountInfo(recipientPubkey);
    const recipientIsNew = !recipientInfo;
    console.log(recipientIsNew);
    console.log(recipientInfo);

    const totalRequired =
      lamportsToSend + estimatedFee + (recipientIsNew ? rentExemptionMin : 0);

    console.log("🧾 Transaction Debug Info:");
    console.log("➡️ Destination:", recipientAddress);
    console.log("🔁 Lamports to send:", lamportsToSend);
    console.log("⚙️ Estimated fee:", estimatedFee);
    console.log("🏠 Rent exemption minimum:", rentExemptionMin);
    console.log("📦 Total lamports required:", totalRequired);
    console.log("👤 Sender balance:", senderBalance);

    if (senderBalance < totalRequired) {
      throw new Error(
        `❌ Insufficient balance. Need at least ${totalRequired} lamports (amount + fee${
          recipientIsNew ? " + rent" : ""
        }), but have ${senderBalance}.`
      );
    }

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1500,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 30000,
    });

    const instructions: TransactionInstruction[] = [
      addPriorityFee,
      modifyComputeUnits,
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: lamportsToSend,
      }),
    ];

    const latestBlockhash = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: senderKeypair.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message();

    return await this.createSendConfirmRetryTransaction(
      messageV0,
      [senderKeypair],
      connection,
      latestBlockhash,
      false,
      senderKeypair,
      instructions
    );
  }

  async createSendConfirmRetryTransaction(
    messageV0: MessageV0,
    senderKeypairs: Keypair[],
    connection: Connection,
    latestBlockhash: {
      blockhash: string;
      lastValidBlockHeight: number;
    },
    isDevnet: boolean,
    feePayerKeypair: Keypair,
    initialInstructions: TransactionInstruction[],
    retryCount = 0
  ): Promise<{
    explorerUrl: string;
    status: boolean;
    signature: string | undefined;
  }> {
    const MAX_RETRIES = 5;
    const txAttempt = retryCount + 1;

    console.log(`⚡ Attempt ${txAttempt}/${MAX_RETRIES}`);

    try {
      const transaction = new VersionedTransaction(messageV0);
      transaction.sign(senderKeypairs);

      const blockhash = messageV0.recentBlockhash;
      const txSignature = bs58.encode(transaction.signatures[0]);
      const explorerUrl = isDevnet
        ? `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
        : `https://solscan.io/tx/${txSignature}`;

      console.log(`Using blockhash: ${blockhash}`);
      console.log(`🧪 Simulating transaction...`);

      const simulation = await connection.simulateTransaction(transaction, {
        replaceRecentBlockhash: true,
        commitment: "processed",
      });

      if (simulation.value.err) {
        console.error(
          "❌ Simulation error:",
          simulation.value.err,
          simulation.value.logs
        );
        throw new Error(
          `Simulation failed: ${JSON.stringify(simulation.value.err)}`
        );
      }

      console.log(`✅ Simulation passed. Sending transaction...`);
      const serializedTransaction = Buffer.from(transaction.serialize());

      const transactionResponse = await transactionSenderAndConfirmationWaiter({
        connection,
        serializedTransaction,
        blockhashWithExpiryBlockHeight: {
          blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
      });

      if (transactionResponse && !transactionResponse.meta?.err) {
        console.log(`✅ Transaction confirmed! View at: ${explorerUrl}`);
        return { explorerUrl, status: true, signature: txSignature };
      }

      // Fallback: attempt polling
      console.warn("⚠️ No confirmation. Initiating fallback polling...");
      for (let i = 0; i < 10; i++) {
        const status = await connection.getSignatureStatus(txSignature);
        const confirmed = status?.value?.confirmationStatus;
        const err = status?.value?.err;

        if (confirmed === "confirmed" || confirmed === "finalized") {
          console.log(`✅ TX ${txSignature} confirmed via polling.`);
          return { explorerUrl, status: true, signature: txSignature };
        }

        if (err) {
          console.error("❌ On-chain error during fallback:", err);
          return { explorerUrl, status: false, signature: txSignature };
        }

        await new Promise((r) => setTimeout(r, 1000));
      }

      // Final check before giving up
      console.warn("🕓 Polling timed out. Performing final status check...");
      const finalStatus = await connection.getSignatureStatus(txSignature);
      const finalConfirmed = finalStatus?.value?.confirmationStatus;
      const finalError = finalStatus?.value?.err;

      if (finalConfirmed === "confirmed" || finalConfirmed === "finalized") {
        console.log(`✅ TX ${txSignature} confirmed via final check.`);
        return { explorerUrl, status: true, signature: txSignature };
      }

      if (finalError) {
        console.error("❌ Final error after polling:", finalError);
        return { explorerUrl, status: false, signature: txSignature };
      }

      console.error("❌ Unable to confirm transaction after all attempts.");
      return { explorerUrl, status: false, signature: txSignature };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          `❌ Error on attempt ${txAttempt}: ${error?.message || error}`
        );
      }

      if (txAttempt >= MAX_RETRIES) {
        console.error("🔥 Max retries reached. Giving up.");
        throw new Error(`Transaction failed after ${MAX_RETRIES} attempts.`);
      }

      const delayMs = Math.pow(2, retryCount) * 1000;
      console.warn(`⏳ Retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));

      const newBlockhash = await connection.getLatestBlockhash();
      const newMessageV0 = new TransactionMessage({
        payerKey: feePayerKeypair.publicKey,
        recentBlockhash: newBlockhash.blockhash,
        instructions: initialInstructions,
      }).compileToV0Message();

      return await this.createSendConfirmRetryTransaction(
        newMessageV0,
        senderKeypairs,
        connection,
        newBlockhash,
        isDevnet,
        feePayerKeypair,
        initialInstructions,
        retryCount + 1
      );
    }
  }
}
