"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  imageUrl?: string;
}

type Brand = {
  id: string;
  name: string;
  colors?: Record<string, string>;
  assets?: { logo?: { light?: string; dark?: string }; favicon?: string };
  meta?: { title?: string; description?: string };
  payment?: { receiver?: string; paystackPublicKey?: string };
  whatsapp?: {
    enabled?: boolean;
    accessToken?: string;
    phoneNumberId?: string;
    verifyWebhook?: boolean;
    webhookSecret?: string;
  };
  inventory?: {
    enabled?: boolean;
    items?: InventoryItem[];
  };
};

export default function BrandEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/brands/${slug}`);
        if (!res.ok) throw new Error("Failed to load brand");
        const data = await res.json();
        if (!cancelled) setBrand(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load brand";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  async function onSave() {
    if (!brand) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/brands/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      });
      if (!res.ok) throw new Error("Failed to save brand");
      // After save, navigate to branded page in new tab
      window.open(`/c/${slug}`, "_blank");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save brand";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-4"><span className="text-sm text-muted-foreground">Loading brand...</span></div>
        <div className="h-40 rounded border border-border bg-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4 text-red-600">{error}</div>
        <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
      </div>
    );
  }

  if (!brand) return null;

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Brand: {brand.name || slug}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.open(`/c/${slug}`, "_blank")}>Open /c/{slug}</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand-name" className="text-sm text-muted-foreground">Name</label>
                <input
                  id="brand-name"
                  className="mt-1 w-full px-3 py-2 rounded border border-border bg-background"
                  value={brand.name || ""}
                  onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                  placeholder="Fruity Gold"
                />
              </div>
              <div>
                <label htmlFor="brand-id" className="text-sm text-muted-foreground">ID (slug)</label>
                <input
                  id="brand-id"
                  className="mt-1 w-full px-3 py-2 rounded border border-border bg-muted/50"
                  value={brand.id || ""}
                  readOnly
                  placeholder="fruity-gold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-whatsapp-enabled" className="text-sm text-muted-foreground">Enable WhatsApp Notifications</label>
              <input
                id="brand-whatsapp-enabled"
                type="checkbox"
                className="h-4 w-4"
                checked={!!brand.whatsapp?.enabled}
                onChange={(e) => setBrand({
                  ...brand,
                  whatsapp: { ...(brand.whatsapp || {}), enabled: e.target.checked }
                })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-whatsapp-token" className="text-sm text-muted-foreground">Access Token</label>
              <input
                id="brand-whatsapp-token"
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.whatsapp?.accessToken || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  whatsapp: { ...(brand.whatsapp || {}), accessToken: e.target.value }
                })}
                placeholder="EAAG... (Meta WhatsApp token)"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-whatsapp-phone" className="text-sm text-muted-foreground">Phone Number ID</label>
              <input
                id="brand-whatsapp-phone"
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.whatsapp?.phoneNumberId || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  whatsapp: { ...(brand.whatsapp || {}), phoneNumberId: e.target.value }
                })}
                placeholder="123456789012345"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-whatsapp-verify" className="text-sm text-muted-foreground">Verify Webhook</label>
              <input
                id="brand-whatsapp-verify"
                type="checkbox"
                className="h-4 w-4"
                checked={!!brand.whatsapp?.verifyWebhook}
                onChange={(e) => setBrand({
                  ...brand,
                  whatsapp: { ...(brand.whatsapp || {}), verifyWebhook: e.target.checked }
                })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-whatsapp-secret" className="text-sm text-muted-foreground">Webhook Secret</label>
              <input
                id="brand-whatsapp-secret"
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.whatsapp?.webhookSecret || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  whatsapp: { ...(brand.whatsapp || {}), webhookSecret: e.target.value }
                })}
                placeholder="secret"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "primary","primaryForeground","secondary","secondaryForeground",
              "accent","accentForeground","foreground","background",
              "darkForeground","darkBackground"
            ].map((key) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <label className="text-sm text-muted-foreground">{key}</label>
                <input
                  className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                  value={brand.colors?.[key] || ""}
                  onChange={(e) => setBrand({
                    ...brand,
                    colors: { ...(brand.colors || {}), [key]: e.target.value }
                  })}
                  placeholder={key.includes("color") ? "#000000" : "value"}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label className="text-sm text-muted-foreground">Logo (light)</label>
              <input
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.assets?.logo?.light || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  assets: { ...(brand.assets || {}), logo: { ...(brand.assets?.logo || {}), light: e.target.value } }
                })}
                placeholder="/brands/fruity-gold/logo-light.png"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label className="text-sm text-muted-foreground">Logo (dark)</label>
              <input
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.assets?.logo?.dark || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  assets: { ...(brand.assets || {}), logo: { ...(brand.assets?.logo || {}), dark: e.target.value } }
                })}
                placeholder="/brands/fruity-gold/logo-dark.png"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label className="text-sm text-muted-foreground">Favicon</label>
              <input
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.assets?.favicon || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  assets: { ...(brand.assets || {}), favicon: e.target.value }
                })}
                placeholder="/brands/fruity-gold/favicon.ico"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-payment-receiver" className="text-sm text-muted-foreground">Crypto Receiver (wallet)</label>
              <input
                id="brand-payment-receiver"
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.payment?.receiver || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  payment: { ...(brand.payment || {}), receiver: e.target.value }
                })}
                placeholder="0x... (wallet address)"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-payment-paystack" className="text-sm text-muted-foreground">Paystack Public Key</label>
              <input
                id="brand-payment-paystack"
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.payment?.paystackPublicKey || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  payment: { ...(brand.payment || {}), paystackPublicKey: e.target.value }
                })}
                placeholder="pk_live_xxx or pk_test_xxx"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="brand-meta-title" className="text-sm text-muted-foreground">Title</label>
              <input
                id="brand-meta-title"
                className="mt-1 w-full px-3 py-2 rounded border border-border bg-background"
                value={brand.meta?.title || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  meta: { ...(brand.meta || {}), title: e.target.value }
                })}
                placeholder="Fruity Gold Invoicing"
              />
            </div>
            <div>
              <label htmlFor="brand-meta-description" className="text-sm text-muted-foreground">Description</label>
              <textarea
                id="brand-meta-description"
                className="mt-1 w-full px-3 py-2 rounded border border-border bg-background"
                value={brand.meta?.description || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  meta: { ...(brand.meta || {}), description: e.target.value }
                })}
                rows={3}
                placeholder="Invoices and instant payments powered by Zyra"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="inventory-enabled" className="text-sm text-muted-foreground">
                Enable Inventory Management
              </label>
              <input
                id="inventory-enabled"
                type="checkbox"
                className="h-4 w-4"
                checked={!!brand.inventory?.enabled}
                onChange={(e) => setBrand({
                  ...brand,
                  inventory: { 
                    ...(brand.inventory || {}), 
                    enabled: e.target.checked,
                    items: brand.inventory?.items || []
                  }
                })}
              />
            </div>

            {brand.inventory?.enabled && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Inventory Items</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newItem: InventoryItem = {
                        id: `item-${Date.now()}`,
                        name: '',
                        price: 0,
                        quantity: 0
                      };
                      setBrand({
                        ...brand,
                        inventory: {
                          ...brand.inventory!,
                          items: [...(brand.inventory?.items || []), newItem]
                        }
                      });
                    }}
                  >
                    + Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {brand.inventory?.items?.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground">Name</label>
                          <input
                            className="w-full mt-1 px-3 py-2 rounded border border-border bg-background"
                            value={item.name}
                            onChange={(e) => {
                              const items = [...(brand.inventory?.items || [])];
                              items[index] = { ...item, name: e.target.value };
                              setBrand({
                                ...brand,
                                inventory: { ...brand.inventory!, items }
                              });
                            }}
                            placeholder="Item name"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">SKU (Optional)</label>
                          <input
                            className="w-full mt-1 px-3 py-2 rounded border border-border bg-background"
                            value={item.sku || ''}
                            onChange={(e) => {
                              const items = [...(brand.inventory?.items || [])];
                              items[index] = { ...item, sku: e.target.value };
                              setBrand({
                                ...brand,
                                inventory: { ...brand.inventory!, items }
                              });
                            }}
                            placeholder="SKU-123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground">Description (Optional)</label>
                        <textarea
                          className="w-full mt-1 px-3 py-2 rounded border border-border bg-background"
                          value={item.description || ''}
                          onChange={(e) => {
                            const items = [...(brand.inventory?.items || [])];
                            items[index] = { ...item, description: e.target.value };
                            setBrand({
                              ...brand,
                              inventory: { ...brand.inventory!, items }
                            });
                          }}
                          placeholder="Item description"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor={`price-${item.id}`} className="text-sm text-muted-foreground">
                            Price
                          </label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                            <input
                              id={`price-${item.id}`}
                              type="number"
                              className="w-full pl-8 pr-3 py-2 rounded border border-border bg-background"
                              value={item.price}
                              onChange={(e) => {
                                const items = [...(brand.inventory?.items || [])];
                                items[index] = { ...item, price: parseFloat(e.target.value) || 0 };
                                setBrand({
                                  ...brand,
                                  inventory: { ...brand.inventory!, items }
                                });
                              }}
                              min="0"
                              step="0.01"
                              aria-label="Item price in dollars"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`quantity-${item.id}`} className="text-sm text-muted-foreground">
                            Quantity
                          </label>
                          <input
                            id={`quantity-${item.id}`}
                            type="number"
                            className="w-full mt-1 px-3 py-2 rounded border border-border bg-background"
                            value={item.quantity}
                            onChange={(e) => {
                              const items = [...(brand.inventory?.items || [])];
                              items[index] = { ...item, quantity: parseInt(e.target.value) || 0 };
                              setBrand({
                                ...brand,
                                inventory: { ...brand.inventory!, items }
                              });
                            }}
                            min="0"
                            aria-label="Item quantity in stock"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Image URL (Optional)</label>
                          <input
                            className="w-full mt-1 px-3 py-2 rounded border border-border bg-background"
                            value={item.imageUrl || ''}
                            onChange={(e) => {
                              const items = [...(brand.inventory?.items || [])];
                              items[index] = { ...item, imageUrl: e.target.value };
                              setBrand({
                                ...brand,
                                inventory: { ...brand.inventory!, items }
                              });
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const items = (brand.inventory?.items || []).filter((_, i) => i !== index);
                            setBrand({
                              ...brand,
                              inventory: { ...brand.inventory!, items }
                            });
                          }}
                        >
                          Remove Item
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
