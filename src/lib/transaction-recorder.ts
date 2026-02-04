import crypto from 'crypto';
import { TransactionStatus } from './transaction-registry';

// Generate a reference hash from payment data
export const generateReferenceHash = (
  paymentReference: string,
  amount: string,
  customerName: string,
  timestamp: number
): string => {
  const data = `${paymentReference}:${amount}:${customerName}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Generate a reference hash for crypto payments
export const generateCryptoReferenceHash = (
  transactionHash: string,
  receiver: string,
  amount: string,
  token: string,
  timestamp: number
): string => {
  const data = `${transactionHash}:${receiver}:${amount}:${token}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export interface TransactionRecordData {
  merchant: string;
  payer: string;
  amount: bigint;
  token: string;
  referenceHash: string;
  paymentMethod: 'mobile_money' | 'crypto';
  paymentReference: string;
  customerName: string;
  description?: string;
}

// Record transaction to registry (server-side - called from API routes)
export const recordTransactionToRegistry = async (
  data: TransactionRecordData
): Promise<{ success: boolean; hash?: string; error?: string }> => {
  try {
    // This would be called from a backend service with proper signing
    // For now, we'll log it to demonstrate the integration
    console.log('Recording transaction to registry:', {
      merchant: data.merchant,
      payer: data.payer,
      amount: data.amount.toString(),
      token: data.token,
      referenceHash: data.referenceHash,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
      customerName: data.customerName,
      timestamp: new Date().toISOString(),
    });

    // In production, you would:
    // 1. Sign the transaction with your backend wallet
    // 2. Call recordTransaction on the smart contract
    // 3. Wait for the transaction to be mined
    // 4. Return the transaction hash

    return {
      success: true,
      hash: `0x${crypto.randomBytes(32).toString('hex')}`, // Mock hash
    };
  } catch (error) {
    console.error('Error recording transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export interface TransactionStatusUpdateData {
  transactionId: bigint;
  status: TransactionStatus;
  paymentReference: string;
}

// Update transaction status (server-side)
export const updateTransactionStatusRegistry = async (
  data: TransactionStatusUpdateData
): Promise<{ success: boolean; hash?: string; error?: string }> => {
  try {
    console.log('Updating transaction status in registry:', {
      transactionId: data.transactionId.toString(),
      status: TransactionStatus[data.status],
      paymentReference: data.paymentReference,
      timestamp: new Date().toISOString(),
    });

    // In production, you would:
    // 1. Sign the transaction with your backend wallet
    // 2. Call updateTransactionStatus on the smart contract
    // 3. Wait for the transaction to be mined
    // 4. Return the transaction hash

    return {
      success: true,
      hash: `0x${crypto.randomBytes(32).toString('hex')}`, // Mock hash
    };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
