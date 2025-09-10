"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');

    if (status === 'success' && reference) {
      setStatus('success');
      setMessage('Payment successful! Your transaction has been completed.');
    } else {
      setStatus('error');
      setMessage('Payment failed or was cancelled. Please try again.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'success' ? (
              <Check className="h-8 w-8 text-green-500" />
            ) : status === 'error' ? (
              <X className="h-8 w-8 text-red-500" />
            ) : (
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            {status === 'loading' ? 'Processing...' : status === 'success' ? 'Payment Successful' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <Button 
            onClick={() => window.close()} 
            className="w-full"
            variant={status === 'success' ? 'default' : 'outline'}
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
