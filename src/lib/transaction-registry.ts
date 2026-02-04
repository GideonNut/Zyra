import { getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client } from "./constants";
import { defineChain } from "thirdweb/chains";

// Lisk Mainnet configuration
const LISK_MAINNET = defineChain({
  id: 1135,
  name: "Lisk",
  rpc: "https://rpc.mainnet.lisk.com",
  blockExplorer: {
    name: "Lisk Scan",
    url: "https://liskscan.com",
    apiUrl: "https://api.liskscan.com/api",
  },
} as any);

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TRANSACTION_REGISTRY_ADDRESS || "0x00FE619DD3d5cd516DEC65A629823fc557A6eA9a";

// TransactionRegistry ABI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSACTION_REGISTRY_ABI: any = [
  {
    type: "function",
    name: "recordTransaction",
    inputs: [
      { name: "merchant", type: "address" },
      { name: "payer", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "token", type: "address" },
      { name: "referenceHash", type: "string" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateTransactionStatus",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getTransaction",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "merchant", type: "address" },
          { name: "payer", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "token", type: "address" },
          { name: "referenceHash", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMerchantTxIds",
    inputs: [{ name: "merchant", type: "address" }],
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TransactionRecorded",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "merchant", type: "address", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "amount", type: "uint256" },
      { name: "token", type: "address" },
      { name: "referenceHash", type: "string" },
      { name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "TransactionStatusUpdated",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "status", type: "uint8" },
      { name: "timestamp", type: "uint256" },
    ],
  },
];

// Transaction status enum
export enum TransactionStatus {
  Recorded = 0,
  Settled = 1,
  Refunded = 2,
}

// Get contract instance
export const getTransactionRegistryContract = () => {
  return getContract({
    client,
    chain: LISK_MAINNET,
    address: CONTRACT_ADDRESS,
    abi: TRANSACTION_REGISTRY_ABI,
  });
};

// Record a transaction
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const recordTransaction = async (
  account: any,
  merchant: string,
  payer: string,
  amount: bigint,
  token: string,
  referenceHash: string
): Promise<string> => {
  try {
    const contract = getTransactionRegistryContract();
    
    const transaction = prepareContractCall({
      contract,
      method: "recordTransaction",
      params: [merchant, payer, amount, token, referenceHash],
    });

    const result = await sendTransaction({
      account,
      transaction,
    });

    // Parse the transaction receipt to get the ID
    if (result) {
      // You can emit an event or log the transaction hash
      console.log("Transaction recorded:", result.transactionHash);
    }

    return result.transactionHash;
  } catch (error) {
    console.error("Error recording transaction:", error);
    throw error;
  }
};

// Update transaction status
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateTransactionStatus = async (
  account: any,
  transactionId: bigint,
  status: TransactionStatus
): Promise<{ transactionHash: string }> => {
  try {
    const contract = getTransactionRegistryContract();
    
    const transaction = prepareContractCall({
      contract,
      method: "updateTransactionStatus",
      params: [transactionId, status],
    });

    const result = await sendTransaction({
      account,
      transaction,
    });

    console.log("Transaction status updated:", result.transactionHash);
    return result;
  } catch (error) {
    console.error("Error updating transaction status:", error);
    throw error;
  }
};

// Get transaction details
export const getTransaction = async (transactionId: bigint) => {
  try {
    const contract = getTransactionRegistryContract();
    
    const tx = await readContract({
      contract,
      method: "getTransaction",
      params: [transactionId],
    });

    return tx;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
};

// Get merchant transactions
export const getMerchantTransactions = async (merchantAddress: string) => {
  try {
    const contract = getTransactionRegistryContract();
    
    const txIds = await readContract({
      contract,
      method: "getMerchantTxIds",
      params: [merchantAddress],
    });

    return txIds;
  } catch (error) {
    console.error("Error fetching merchant transactions:", error);
    throw error;
  }
};

export { LISK_MAINNET };
