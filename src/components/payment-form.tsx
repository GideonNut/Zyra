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
import { useState, useEffect } from "react";
import { toUnits } from "thirdweb";
import { TokenSelector } from "@/components/ui/token-selector";
import { SingleNetworkSelector } from "@/components/ui/network-selector";
import { client } from "@/lib/constants";
import { useBrand, InventoryItem } from "@/contexts/brand-context";

// Extend Window interface for Paystack
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: () => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

const formSchema = z.object({
  customerName: z.string().min(1, "Customer Name is required").max(100, "Customer Name must be less than 100 characters"),
  phoneNumber: z.string().optional(),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)), {
    message: "Amount must be a valid number",
  }),
  currency: z.enum(["GHS", "USD", "CRYPTO"]).default("GHS"),
  paymentMethod: z.enum(["mobile_money", "crypto"]).default("mobile_money"),
  description: z.string().optional(),
  selectedItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(0),
  })).default([]),
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
  const { brand, slug } = useBrand();
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
      selectedItems: [],
    },
  });

  // Calculate total from selected items when inventory is enabled
  const watchSelectedItems = form.watch("selectedItems");
  
  useEffect(() => {
    if (brand?.inventory?.enabled && watchSelectedItems && watchSelectedItems.length > 0) {
      const total = watchSelectedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
      form.setValue("amount", total.toFixed(2));
    }
  }, [watchSelectedItems, brand?.inventory?.enabled, form]);

  // Handle inventory item quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    const currentItems = form.getValues("selectedItems") || [];
    const itemIndex = currentItems.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: Math.max(0, quantity)
      };
      form.setValue("selectedItems", updatedItems);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (item: InventoryItem) => {
    const currentItems = form.getValues("selectedItems") || [];
    const itemIndex = currentItems.findIndex(i => i.id === item.id);
    
    if (itemIndex >= 0) {
      // Remove item if already selected
      const updatedItems = currentItems.filter(i => i.id !== item.id);
      form.setValue("selectedItems", updatedItems);
    } else {
      // Add item with quantity 1
      form.setValue("selectedItems", [
        ...currentItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }
      ]);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsCreating(true);
    try {
      // Validate inventory items if inventory is enabled
      if (brand?.inventory?.enabled) {
        const hasItems = values.selectedItems && values.selectedItems.length > 0;
        if (!hasItems) {
          alert("Please select at least one item from inventory");
          setIsCreating(false);
          return;
        }
        
        const hasValidQuantities = values.selectedItems.every(
          item => item.quantity > 0
        );
        if (!hasValidQuantities) {
          alert("Please enter valid quantities for all selected items");
          setIsCreating(false);
          return;
        }
      }
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
              receiver: brand?.payment?.receiver || account!.address,
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
            companySlug: slug,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }

        const data = await response.json();
        
        // Initialize Paystack payment
        if (typeof window !== 'undefined' && window.PaystackPop) {
          const paystack = window.PaystackPop.setup({
            key: (brand?.payment?.paystackPublicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''),
            email: data.email,
            amount: data.amount,
            currency: data.currency,
            ref: data.reference,
            callback: function() {
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
                        Mobile Money
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
                        Crypto
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

            {brand?.inventory?.enabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Select Items from Inventory</h4>
                  {form.watch("selectedItems")?.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {form.watch("selectedItems")?.length} item(s) selected
                    </span>
                  )}
                </div>
                
                {brand.inventory.items && brand.inventory.items.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {brand.inventory.items.map((item) => {
                        const selectedItem = form.watch("selectedItems")?.find(i => i.id === item.id);
                        const isSelected = !!selectedItem;
                        const itemTotal = isSelected ? (selectedItem.quantity * item.price) : 0;
                        const availableStock = item.quantity || 0;
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`p-4 border rounded-lg transition-colors ${
                              isSelected 
                                ? 'border-primary bg-primary/5 shadow-sm' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {item.imageUrl && (
                                <div className="w-16 h-16 rounded-md overflow-hidden border border-border flex-shrink-0">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-sm font-semibold">
                                        {form.watch("currency") === "CRYPTO" ? "Crypto" : form.watch("currency")} {item.price.toFixed(2)}
                                      </span>
                                      {item.sku && (
                                        <span className="text-xs text-muted-foreground">
                                          SKU: {item.sku}
                                        </span>
                                      )}
                                      {availableStock > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                          Stock: {availableStock}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  {isSelected ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleQuantityChange(item.id, (selectedItem?.quantity || 1) - 1)}
                                          disabled={!selectedItem?.quantity || selectedItem.quantity <= 0}
                                          className="h-8 w-8 p-0"
                                        >
                                          -
                                        </Button>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={availableStock > 0 ? availableStock : undefined}
                                          value={selectedItem?.quantity || 0}
                                          onChange={(e) => {
                                            const qty = parseInt(e.target.value) || 0;
                                            const maxQty = availableStock > 0 ? availableStock : undefined;
                                            handleQuantityChange(item.id, maxQty ? Math.min(qty, maxQty) : qty);
                                          }}
                                          className="w-20 text-center h-8"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const currentQty = selectedItem?.quantity || 0;
                                            const maxQty = availableStock > 0 ? availableStock : undefined;
                                            handleQuantityChange(item.id, maxQty ? Math.min(currentQty + 1, maxQty) : currentQty + 1);
                                          }}
                                          disabled={availableStock > 0 && (selectedItem?.quantity || 0) >= availableStock}
                                          className="h-8 w-8 p-0"
                                        >
                                          +
                                        </Button>
                                        {availableStock > 0 && (selectedItem?.quantity || 0) >= availableStock && (
                                          <span className="text-xs text-destructive ml-2">
                                            Max stock reached
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Subtotal</p>
                                        <p className="text-sm font-semibold">
                                          {form.watch("currency") === "CRYPTO" ? "Crypto" : form.watch("currency")} {itemTotal.toFixed(2)}
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant={availableStock === 0 ? "secondary" : "outline"}
                                      size="sm"
                                      onClick={() => toggleItemSelection(item)}
                                      disabled={availableStock === 0}
                                      className="w-full"
                                    >
                                      {availableStock === 0 ? "Out of Stock" : "Add to Invoice"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {form.watch("selectedItems")?.length > 0 && (
                      <div className="pt-4 border-t space-y-2">
                        <div className="space-y-1">
                          {form.watch("selectedItems")?.map((selectedItem) => {
                            const item = brand.inventory?.items?.find(i => i.id === selectedItem.id);
                            if (!item) return null;
                            return (
                              <div key={selectedItem.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {item.name} × {selectedItem.quantity}
                                </span>
                                <span>
                                  {form.watch("currency") === "CRYPTO" ? "Crypto" : form.watch("currency")} {(selectedItem.quantity * item.price).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t font-semibold">
                          <span>Total Amount:</span>
                          <span className="text-lg">
                            {form.watch("currency") === "CRYPTO" ? "Crypto" : form.watch("currency")} {form.watch("amount")}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No inventory items available. Please add items in the admin panel.
                    </p>
                  </div>
                )}
              </div>
            )}

            {(!brand?.inventory?.enabled || form.watch("selectedItems")?.length === 0) && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0.1" 
                        type="number" 
                        step="any" 
                        {...field} 
                        disabled={form.watch("selectedItems")?.length > 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
