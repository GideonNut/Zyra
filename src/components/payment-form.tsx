"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useActiveAccount } from "thirdweb/react";
import { useState } from "react";
import { toUnits } from "thirdweb";
import { TokenSelector } from "@/components/ui/token-selector";
import { SingleNetworkSelector } from "@/components/ui/network-selector";
import { client } from "@/lib/constants";

const formSchema = z.object({
  customerName: z.string().min(1, "Customer Name is required").max(100, "Customer Name must be less than 100 characters"),
  phoneNumber: z.string().optional(),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)), {
    message: "Amount must be a valid number",
  }),
  currency: z.enum(["GHS", "USD", "CRYPTO"]).default("GHS"),
  paymentMethod: z.enum(["mobile_money", "crypto"]).default("mobile_money"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type TokenMetadata = {
  chainId: number;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  iconUri?: string;
  priceUsd?: number;
};

interface PaymentFormProps {
  onSuccess?: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps = {}) {
  const account = useActiveAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenMetadata | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "crypto">("mobile_money");

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      amount: "",
      currency: "GHS",
      paymentMethod: "mobile_money",
      description: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsCreating(true);
    try {
      if (values.paymentMethod === "crypto") {
        // Handle crypto payments
        if (!selectedChainId) {
          alert("Please select a chain");
          return;
        }

        if (!selectedToken) {
          alert("Please select a token");
          return;
        }

        // Convert amount to smallest units using thirdweb's toUnits function
        const amountInWei = toUnits(values.amount, selectedToken.decimals).toString();

        const response = await fetch('/api/create-payment-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: values.customerName,
            description: values.description || undefined,
            intent: {
              destinationChainId: selectedChainId,
              destinationTokenAddress: selectedToken.address,
              receiver: account!.address,
              amount: amountInWei,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment link');
        }

        const data = await response.json();
        setPaymentLink(data.link);

        // Open QR code page in new tab
        if (data.id) {
          const qrUrl = `/${data.id}`;
          window.open(qrUrl, '_blank');
        }
      } else {
        // Handle mobile money payments
        const response = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: values.customerName,
            phoneNumber: values.phoneNumber,
            amount: values.amount,
            currency: values.currency,
            description: values.description,
            email: `${values.phoneNumber}@mobilemoney.gh`, // Use phone as email for mobile money
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }

        const data = await response.json();
        
        // Initialize Paystack payment
        if (typeof window !== 'undefined' && (window as any).PaystackPop) {
          const paystack = (window as any).PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            email: data.email,
            amount: data.amount,
            currency: data.currency,
            ref: data.reference,
            callback: function(response: any) {
              // Verify payment
              verifyPayment(data.reference);
            },
            onClose: function() {
              alert('Payment cancelled');
            }
          });
          paystack.openIframe();
        }
      }

      // Reset form
      form.reset();
      setSelectedToken(null);
      setSelectedChainId(undefined);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    } finally {
      setIsCreating(false);
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      if (response.ok) {
        alert('Payment successful!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Payment verification failed');
    }
  };

  return (
    <div className="flex justify-stretch w-full">
      <div className="w-full pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={field.value === "mobile_money" ? "default" : "outline"}
                        onClick={() => {
                          field.onChange("mobile_money");
                          setPaymentMethod("mobile_money");
                        }}
                        className="flex-1"
                      >
                        📱 Mobile Money
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "crypto" ? "default" : "outline"}
                        onClick={() => {
                          field.onChange("crypto");
                          setPaymentMethod("crypto");
                        }}
                        className="flex-1"
                      >
                        ₿ Crypto
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === "mobile_money" && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+233XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="GHS">GHS - Ghana Cedi</option>
                      <option value="USD">USD - US Dollar</option>
                      {paymentMethod === "crypto" && <option value="CRYPTO">Crypto</option>}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional details about this invoice..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === "crypto" && (
              <>
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <FormControl>
                    <SingleNetworkSelector
                      chainId={selectedChainId}
                      onChange={setSelectedChainId}
                      placeholder="Select a chain"
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <TokenSelector
                      selectedToken={selectedToken ? { chainId: selectedToken.chainId, address: selectedToken.address } : undefined}
                      onChange={setSelectedToken}
                      chainId={selectedChainId || 1}
                      client={client}
                      enabled={!!selectedChainId}
                      placeholder="Select a token"
                    />
                  </FormControl>
                </FormItem>
              </>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.1" type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {paymentMethod === "mobile_money" ? "Processing..." : "Creating..."}
                </>
              ) : (
                paymentMethod === "mobile_money" ? "Process Payment" : "Create Invoice"
              )}
            </Button>

            {paymentLink && (
              <div className="mt-4 p-4 bg-green-950/50 border border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-400">Invoice created!</p>
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline break-all"
                >
                  {paymentLink}
                </a>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
