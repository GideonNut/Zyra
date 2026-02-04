import { useState, useCallback } from 'react';
import { generateReferenceHash, generateCryptoReferenceHash } from '@/lib/transaction-recorder';

export interface PaymentTrackingData {
  paymentReference: string;
  amount: string;
  customerName: string;
  paymentMethod: 'mobile_money' | 'crypto';
  currency: string;
  description?: string;
  payer?: string;
  receiver?: string;
  token?: string;
  transactionHash?: string;
}

export const usePaymentTracking = () => {
  const [trackingData, setTrackingData] = useState<PaymentTrackingData | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback((data: PaymentTrackingData) => {
    setTrackingData(data);
    setIsTracking(true);
  }, []);

  const generateReferenceHashForPayment = useCallback((data: PaymentTrackingData): string => {
    if (data.paymentMethod === 'mobile_money') {
      return generateReferenceHash(
        data.paymentReference,
        data.amount,
        data.customerName,
        Math.floor(Date.now() / 1000)
      );
    } else {
      return generateCryptoReferenceHash(
        data.transactionHash || data.paymentReference,
        data.receiver || '0x0000000000000000000000000000000000000000',
        data.amount,
        data.token || '0x0000000000000000000000000000000000000000',
        Math.floor(Date.now() / 1000)
      );
    }
  }, []);

  const stopTracking = useCallback(() => {
    setTrackingData(null);
    setIsTracking(false);
  }, []);

  return {
    trackingData,
    isTracking,
    startTracking,
    stopTracking,
    generateReferenceHashForPayment,
  };
};
