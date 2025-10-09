'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectWithSearch } from '@/components/ui/select-with-search';

interface WhatsAppStatus {
  enabled: boolean;
  configured: boolean;
  webhookVerification: boolean;
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  hasWebhookSecret: boolean;
}

export function WhatsAppTest() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  // Test form data
  const [testData, setTestData] = useState({
    phoneNumber: '',
    message: '',
    customerName: '',
    amount: '',
    currency: 'GHS',
    paymentMethod: 'mobile_money',
    reference: '',
    type: 'custom'
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      setTestResult('Error fetching status');
    } finally {
      setLoading(false);
    }
  };

  type NotificationType = 'custom' | 'payment_success' | 'payment_notification';
  type BasePayload = { phoneNumber: string; type: NotificationType };
  type CustomPayload = BasePayload & { type: 'custom'; message: string };
  type PaymentPayload = BasePayload & {
    type: 'payment_success' | 'payment_notification';
    customerName: string;
    amount: string;
    currency: string;
    paymentMethod: string;
    reference?: string;
  };

  const sendTestMessage = async () => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      let payload: CustomPayload | PaymentPayload;

      if (testData.type === 'custom') {
        payload = {
          phoneNumber: testData.phoneNumber,
          type: 'custom',
          message: testData.message,
        };
      } else {
        payload = {
          phoneNumber: testData.phoneNumber,
          type: testData.type as 'payment_success' | 'payment_notification',
          customerName: testData.customerName,
          amount: testData.amount,
          currency: testData.currency,
          paymentMethod: testData.paymentMethod,
          ...(testData.reference ? { reference: testData.reference } : {}),
        };
      }

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ ${result.message}`);
      } else {
        setTestResult(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      setTestResult('❌ Error sending test message');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>WhatsApp Notifications Test</CardTitle>
        <CardDescription>
          Test WhatsApp notifications and check service status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Service Status</h3>
            <Button onClick={fetchStatus} disabled={loading}>
              {loading ? 'Checking...' : 'Check Status'}
            </Button>
          </div>
          
          {status && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span className={status.enabled ? 'text-green-600' : 'text-red-600'}>
                  {status.enabled ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Configured:</span>
                <span className={status.configured ? 'text-green-600' : 'text-red-600'}>
                  {status.configured ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Access Token:</span>
                <span className={status.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
                  {status.hasAccessToken ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phone Number ID:</span>
                <span className={status.hasPhoneNumberId ? 'text-green-600' : 'text-red-600'}>
                  {status.hasPhoneNumberId ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Webhook Verification:</span>
                <span className={status.webhookVerification ? 'text-green-600' : 'text-red-600'}>
                  {status.webhookVerification ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Webhook Secret:</span>
                <span className={status.hasWebhookSecret ? 'text-green-600' : 'text-red-600'}>
                  {status.hasWebhookSecret ? '✅' : '❌'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Test Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Send Test Message</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g., +233123456789 or 0123456789"
                value={testData.phoneNumber}
                onChange={(e) => setTestData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="type">Message Type</Label>
              <SelectWithSearch
                options={[
                  { label: 'Custom Message', value: 'custom' },
                  { label: 'Payment Success', value: 'payment_success' },
                  { label: 'Payment Notification', value: 'payment_notification' },
                ]}
                placeholder="Select type"
                value={testData.type}
                onValueChange={(value) => setTestData(prev => ({ ...prev, type: value }))}
              />
            </div>

            {testData.type === 'custom' ? (
              <div>
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter your custom message"
                  value={testData.message}
                  onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Customer name"
                    value={testData.customerName}
                    onChange={(e) => setTestData(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={testData.amount}
                    onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <SelectWithSearch
                      options={[
                        { label: 'GHS', value: 'GHS' },
                        { label: 'USD', value: 'USD' },
                      ]}
                      placeholder="Select currency"
                      value={testData.currency}
                      onValueChange={(value) => setTestData(prev => ({ ...prev, currency: value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <SelectWithSearch
                      options={[
                        { label: 'Mobile Money', value: 'mobile_money' },
                        { label: 'Cryptocurrency', value: 'crypto' },
                      ]}
                      placeholder="Select method"
                      value={testData.paymentMethod}
                      onValueChange={(value) => setTestData(prev => ({ ...prev, paymentMethod: value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reference">Reference (Optional)</Label>
                  <Input
                    id="reference"
                    placeholder="Payment reference"
                    value={testData.reference}
                    onChange={(e) => setTestData(prev => ({ ...prev, reference: e.target.value }))}
                  />
                </div>
              </>
            )}

            <Button 
              onClick={sendTestMessage} 
              disabled={testLoading || !testData.phoneNumber}
              className="w-full"
            >
              {testLoading ? 'Sending...' : 'Send Test Message'}
            </Button>

            {testResult && (
              <div className="p-3 rounded-md bg-gray-100 text-sm">
                {testResult}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

