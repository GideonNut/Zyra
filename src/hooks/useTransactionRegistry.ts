import { useCallback, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
  recordTransaction,
  updateTransactionStatus,
  getTransaction,
  getMerchantTransactions,
  TransactionStatus,
} from '@/lib/transaction-registry';

export const useTransactionRegistry = () => {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const record = useCallback(
    async (
      merchant: string,
      payer: string,
      amount: bigint,
      token: string,
      referenceHash: string
    ) => {
      if (!account) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await recordTransaction(account, merchant, payer, amount, token, referenceHash);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to record transaction';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [account]
  );

  const updateStatus = useCallback(
    async (transactionId: bigint, status: TransactionStatus) => {
      if (!account) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await updateTransactionStatus(account, transactionId, status);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction status';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [account]
  );

  const fetchTransaction = useCallback(async (transactionId: bigint) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getTransaction(transactionId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMerchantTransactions = useCallback(async (merchantAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMerchantTransactions(merchantAddress);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch merchant transactions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    record,
    updateStatus,
    fetchTransaction,
    fetchMerchantTransactions,
    isLoading,
    error,
    isConnected: !!account,
  };
};
