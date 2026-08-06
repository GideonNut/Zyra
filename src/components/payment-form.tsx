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
import { useBrand, InventoryItem, Brand } from "@/contexts/brand-context";

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
  paymentMethod: z.enum(["mobile_money", "crypto", "cash"]).default("mobile_money"),
  skipPayment: z.boolean().optional().default(false),
  description: z.string().optional(),
  selectedItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    costPrice: z.number().optional(),
    quantity: z.number().min(0),
  })).default([]),
});

function paymentMethodsForBrand(brand: Brand | undefined) {
  const mobileMoney =
    !!brand?.payment?.mobileMoneyEnabled && !!brand?.payment?.paystackPublicKey;
  const crypto =
    !!brand?.payment?.cryptoEnabled && !!brand?.payment?.receiver;
  const cash = !!brand?.payment?.cashEnabled;
  return { mobileMoney, crypto, cash };
}

function getInventoryItemEffectivePrice(item: InventoryItem | undefined, quantity: number) {
  if (!item) return 0;
  if (quantity === 0.5 && typeof item.halfPrice === 'number') return item.halfPrice;
  if (quantity === 0.25 && typeof item.quarterPrice === 'number') return item.quarterPrice;
  return item.price;
}

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

interface GlobalSettings {
  feeRecipient?: string;
}

export function PaymentForm({ onSuccess }: PaymentFormProps = {}) {
  const account = useActiveAccount();
  const { brand, slug, refreshBrand } = useBrand();
  const [isCreating, setIsCreating] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenMetadata | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "crypto" | "cash">("mobile_money");
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({});
  
  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      amount: "",
      currency: "GHS",
      paymentMethod: "mobile_money",
      skipPayment: false,
      description: "",
      selectedItems: [],
    },
  });

  // Load global settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setGlobalSettings(data);
        }
      } catch (error) {
        console.error('Failed to load global settings:', error);
      }
    }
    loadSettings();
  }, []);

  const { mobileMoney: mobileMoneyAvailable, crypto: cryptoAvailable, cash: cashAvailable } =
    paymentMethodsForBrand(brand);

  useEffect(() => {
    const current = form.getValues("paymentMethod");
    const available: Array<"mobile_money" | "crypto" | "cash"> = [];
    if (mobileMoneyAvailable) available.push("mobile_money");
    if (cryptoAvailable) available.push("crypto");
    if (cashAvailable) available.push("cash");
    if (available.length === 0) return;
    if (!available.includes(current)) {
      const next = available[0];
      form.setValue("paymentMethod", next);
      setPaymentMethod(next);
    }
  }, [mobileMoneyAvailable, cryptoAvailable, cashAvailable, form]);

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
    const inventoryItem = brand?.inventory?.items?.find((i) => i.id === itemId);
    const minQty = inventoryItem?.allowHalfQuarter ? 0.25 : 1;
    const normalized = inventoryItem?.allowHalfQuarter
      ? Math.round(Math.max(0, quantity) * 4) / 4
      : Math.max(0, Math.floor(quantity));

    const currentItems = form.getValues("selectedItems") || [];
    const itemIndex = currentItems.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      const updatedItems = [...currentItems];
      const effectivePrice = getInventoryItemEffectivePrice(inventoryItem, normalized);
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: normalized >= minQty || normalized === 0 ? normalized : minQty,
        price: effectivePrice,
      };
      form.setValue("selectedItems", updatedItems);
    }
  };

  const setPortionQuantity = (itemId: string, portion: number) => {
    handleQuantityChange(itemId, portion);
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
          price: getInventoryItemEffectivePrice(item, 1),
          costPrice: item.costPrice ?? 0,
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

        const baseAmount = parseFloat(values.amount);
        const feePercentage = 0.03; // 3%
        const feeAmount = baseAmount * feePercentage;
        const totalAmount = baseAmount + feeAmount;

        // Convert amounts to smallest units using thirdweb's toUnits function
        const baseAmountInWei = toUnits(baseAmount.toString(), selectedToken.decimals).toString();
        const feeAmountInWei = toUnits(feeAmount.toString(), selectedToken.decimals).toString();
        const includesPlatformFee = Boolean(globalSettings?.feeRecipient);
        const totalAmountInWei = includesPlatformFee
          ? (BigInt(baseAmountInWei) + BigInt(feeAmountInWei)).toString()
          : baseAmountInWei;

        const response = await fetch('/api/create-payment-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: values.customerName,
            description: values.description || undefined,
            companySlug: slug,
            destinationToken: {
              chainId: selectedToken.chainId,
              address: selectedToken.address,
              decimals: selectedToken.decimals,
              symbol: selectedToken.symbol,
              name: selectedToken.name,
            },
            intent: {
              destinationChainId: selectedChainId,
              destinationTokenAddress: selectedToken.address,
              receiver: brand?.payment?.receiver || account!.address,
              amount: totalAmountInWei,
            },
            metadata: {
              originalAmount: baseAmount,
              feeAmount: feeAmount,
              feePercentage: 3,
              totalAmount: totalAmount,
            },
            feeBreakdown: includesPlatformFee
              ? {
                  baseAmountWei: baseAmountInWei,
                  feeAmountWei: feeAmountInWei,
                  feePercentage: 3,
                }
              : undefined,
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
        const shouldSkipPayment = Boolean(brand?.payment?.skipPayments) && values.paymentMethod === "mobile_money";
        const isCash = values.paymentMethod === "cash";
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
            email: isCash
              ? `${values.customerName.replace(/\s+/g, '.').toLowerCase()}@cash.local`
              : `${values.phoneNumber}@mobilemoney.gh`,
            companySlug: slug,
            skipPayment: shouldSkipPayment,
            paymentMethod: isCash ? 'cash' : 'mobile_money',
            selectedItems: values.selectedItems.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              costPrice: item.costPrice ?? 0,
              quantity: item.quantity,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }

        const data = await response.json();

        if (data.manual) {
          if (brand?.inventory?.enabled && values.selectedItems?.length && slug) {
            void fetch(`/api/brands/${slug}/inventory`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: values.selectedItems.map((item) => ({ id: item.id, quantity: item.quantity })),
              }),
            })
              .then(async (inventoryResponse) => {
                if (!inventoryResponse.ok) {
                  console.error('Inventory update failed after sale record', await inventoryResponse.text());
                }
              })
              .catch((inventoryError) => {
                console.error('Failed to update inventory after sale:', inventoryError);
              })
              .finally(() => {
                void refreshBrand();
              });
          } else {
            await refreshBrand();
          }
          alert(isCash ? 'Cash sale recorded successfully' : 'Sale recorded successfully without payment');
        } else if (!isCash) {
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
      }
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

            {(mobileMoneyAvailable || cryptoAvailable || cashAvailable) ? (
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {mobileMoneyAvailable && (
                      <Button
                        type="button"
                        variant={field.value === "mobile_money" ? "default" : "outline"}
                        onClick={() => {
                          field.onChange("mobile_money");
                          setPaymentMethod("mobile_money");
                        }}
                        className="flex-1 min-w-[7rem]"
                      >
                        Mobile Money
                      </Button>
                      )}
                      {cryptoAvailable && (
                      <Button
                        type="button"
                        variant={field.value === "crypto" ? "default" : "outline"}
                        onClick={() => {
                          field.onChange("crypto");
                          setPaymentMethod("crypto");
                        }}
                        className="flex-1 min-w-[7rem]"
                      >
                        Crypto
                      </Button>
                      )}
                      {cashAvailable && (
                      <Button
                        type="button"
                        variant={field.value === "cash" ? "default" : "outline"}
                        onClick={() => {
                          field.onChange("cash");
                          setPaymentMethod("cash");
                        }}
                        className="flex-1 min-w-[7rem]"
                      >
                        Cash
                      </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            ) : (
              <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-3">
                No payment methods are enabled for this company. Turn them on in company settings.
              </p>
            )}

            {paymentMethod === "mobile_money" && mobileMoneyAvailable && (
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
                            className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                              isSelected 
                                ? 'border-primary bg-primary/5 shadow-sm' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => toggleItemSelection(item)}
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
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap" onClick={(e) => e.stopPropagation()}>
                                        {item.allowHalfQuarter && (
                                          <div className="flex gap-1">
                                            <Button type="button" variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={() => setPortionQuantity(item.id, 1)}>Full</Button>
                                            <Button type="button" variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={() => setPortionQuantity(item.id, 0.5)}>½</Button>
                                            <Button type="button" variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={() => setPortionQuantity(item.id, 0.25)}>¼</Button>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuantityChange(item.id, (selectedItem?.quantity || 1) - (item.allowHalfQuarter ? 0.25 : 1));
                                          }}
                                          disabled={!selectedItem?.quantity || selectedItem.quantity <= 0}
                                          className="h-8 w-8 p-0"
                                        >
                                          -
                                        </Button>
                                        <Input
                                          type="number"
                                          min="0"
                                          step={item.allowHalfQuarter ? "0.25" : "1"}
                                          max={availableStock > 0 ? availableStock : undefined}
                                          value={selectedItem?.quantity ?? 0}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            const qty = parseFloat(e.target.value) || 0;
                                            const maxQty = availableStock > 0 ? availableStock : undefined;
                                            handleQuantityChange(item.id, maxQty ? Math.min(qty, maxQty) : qty);
                                          }}
                                          className="w-20 text-center h-8"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const currentQty = selectedItem?.quantity || 0;
                                            const step = item.allowHalfQuarter ? 0.25 : 1;
                                            const maxQty = availableStock > 0 ? availableStock : undefined;
                                            handleQuantityChange(item.id, maxQty ? Math.min(currentQty + step, maxQty) : currentQty + step);
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleItemSelection(item);
                                      }}
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

            {paymentMethod === "cash" && cashAvailable && (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium">Cash payment</p>
                <p className="mt-2">
                  Submitting records this sale as paid in cash. No online payment will be initiated.
                </p>
              </div>
            )}
            {brand?.payment?.skipPayments && paymentMethod === "mobile_money" && mobileMoneyAvailable && (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium">Manual sales recording enabled</p>
                <p className="mt-2">
                  This company records mobile money sales manually. Submitting this form will create an invoice record without initiating a payment transaction.
                </p>
              </div>
            )}
            {paymentMethod === "crypto" && form.watch("amount") && globalSettings.feeRecipient && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Amount:</span>
                  <span className="font-medium">{form.watch("amount")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Fee (3%):</span>
                  <span className="font-medium text-orange-500">+{(parseFloat((form.watch("amount") || "0").toString()) * 0.03).toFixed(4)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold">Total to Charge:</span>
                  <span className="font-semibold text-lg">{(parseFloat((form.watch("amount") || "0").toString()) * 1.03).toFixed(4)}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  The customer pays this total in a single crypto payment; the invoice shows the fee as a separate line for clarity.
                </p>
              </div>
            )}
            {paymentMethod === "crypto" && form.watch("amount") && !globalSettings.feeRecipient && (
              <p className="text-xs text-muted-foreground rounded-md border border-dashed border-border p-3">
                Set the Master Fee Recipient in the admin panel to collect the 3% Zyra processing fee on-chain. Until then, invoices use a single payment for the amount you enter above.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isCreating || (!mobileMoneyAvailable && !cryptoAvailable && !cashAvailable)}
            >
              {isCreating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {paymentMethod === "cash"
                    ? "Recording..."
                    : paymentMethod === "mobile_money" && brand?.payment?.skipPayments
                      ? "Recording..."
                      : paymentMethod === "mobile_money"
                        ? "Processing..."
                        : "Creating..."}
                </>
              ) : paymentMethod === "cash" ? (
                "Record Cash Sale"
              ) : paymentMethod === "mobile_money" ? (
                brand?.payment?.skipPayments ? "Record Sale" : "Process Payment"
              ) : (
                "Create Invoice"
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
