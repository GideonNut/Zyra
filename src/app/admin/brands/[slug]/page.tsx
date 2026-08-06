"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, ArrowLeft } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  halfPrice?: number;
  quarterPrice?: number;
  quantity: number;
  sku?: string;
  imageUrl?: string;
  allowHalfQuarter?: boolean;
}

function EmptyZeroNumberInput({
  value,
  onChange,
  id,
  className,
  step,
  min,
  prefix,
  "aria-label": ariaLabel,
  integer,
}: {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
  step?: string;
  min?: string;
  prefix?: string;
  "aria-label"?: string;
  integer?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [editText, setEditText] = useState<string | null>(null);

  const displayValue = focused
    ? (editText ?? (value === 0 ? "" : String(value)))
    : value === 0
      ? ""
      : String(value);

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="number"
        className={className}
        value={displayValue}
        step={step}
        min={min}
        aria-label={ariaLabel}
        onFocus={() => {
          setFocused(true);
          setEditText(value === 0 ? "" : String(value));
        }}
        onBlur={() => {
          setFocused(false);
          setEditText(null);
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setEditText(raw);
          if (raw === "" || raw === "-") {
            onChange(0);
            return;
          }
          const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
      />
    </div>
  );
}

type Brand = {
  id: string;
  name: string;
  colors?: Record<string, string>;
  assets?: { logo?: { light?: string; dark?: string }; favicon?: string };
  meta?: { title?: string; description?: string };
  payment?: {
    receiver?: string;
    paystackPublicKey?: string;
    skipPayments?: boolean;
    cashEnabled?: boolean;
    mobileMoneyEnabled?: boolean;
    cryptoEnabled?: boolean;
  };
  salesDashboardMode?: boolean;
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save brand";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleExcelUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Failed to read file");
        }

        // Parse Excel file
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ""
        }) as (string | number)[][];

        if (jsonData.length < 2) {
          throw new Error("Excel file must have at least a header row and one data row");
        }

        // Get header row (first row)
        const headers = jsonData[0].map((h: string | number) => String(h).toLowerCase().trim());
        
        // Find column indices
        const nameIndex = headers.findIndex(h => 
          h.includes("name") || h.includes("item") || h.includes("product")
        );
        const priceIndex = headers.findIndex(h => 
          h.includes("price") || h.includes("cost") || h.includes("amount")
        );
        const halfPriceIndex = headers.findIndex(h =>
          h.includes("half") && h.includes("price")
        );
        const quarterPriceIndex = headers.findIndex(h =>
          h.includes("quarter") && h.includes("price")
        );
        const quantityIndex = headers.findIndex(h => 
          h.includes("quantity") || h.includes("qty") || h.includes("stock")
        );
        const descriptionIndex = headers.findIndex(h => 
          h.includes("description") || h.includes("desc") || h.includes("details")
        );
        const skuIndex = headers.findIndex(h => 
          h.includes("sku") || h.includes("code") || h.includes("id")
        );
        const imageIndex = headers.findIndex(h => 
          h.includes("image") || h.includes("photo") || h.includes("url")
        );
        const halfQuarterIndex = headers.findIndex(h =>
          h.includes("half") || h.includes("quarter") || h.includes("portion") || h === "½/¼" || h === "1/2"
        );

        if (nameIndex === -1 || priceIndex === -1) {
          throw new Error("Excel file must have 'Name' and 'Price' columns");
        }

        // Parse data rows
        const newItems: InventoryItem[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const name = String(row[nameIndex] || "").trim();
          const priceStr = String(row[priceIndex] || "0").trim();
          
          // Skip empty rows
          if (!name) continue;

          const price = parseFloat(priceStr.replace(/[^0-9.-]/g, "")) || 0;
          const halfPrice = halfPriceIndex !== -1
            ? parseFloat(String(row[halfPriceIndex] || "0").replace(/[^0-9.-]/g, "")) || 0
            : undefined;
          const quarterPrice = quarterPriceIndex !== -1
            ? parseFloat(String(row[quarterPriceIndex] || "0").replace(/[^0-9.-]/g, "")) || 0
            : undefined;
          const quantity = quantityIndex !== -1 
            ? parseInt(String(row[quantityIndex] || "0").trim()) || 0 
            : 0;
          const description = descriptionIndex !== -1 
            ? String(row[descriptionIndex] || "").trim() 
            : undefined;
          const sku = skuIndex !== -1 
            ? String(row[skuIndex] || "").trim() 
            : undefined;
          const imageUrl = imageIndex !== -1 
            ? String(row[imageIndex] || "").trim() 
            : undefined;
          const allowHalfQuarter = halfQuarterIndex !== -1
            ? ["yes", "true", "1", "y", "x", "✓"].includes(String(row[halfQuarterIndex] || "").trim().toLowerCase())
            : undefined;

          newItems.push({
            id: `item-${Date.now()}-${i}`,
            name,
            price,
            costPrice: 0,
            halfPrice: halfPrice ?? undefined,
            quarterPrice: quarterPrice ?? undefined,
            quantity,
            description: description || undefined,
            sku: sku || undefined,
            imageUrl: imageUrl || undefined,
            ...(allowHalfQuarter ? { allowHalfQuarter: true } : {}),
          });
        }

        if (newItems.length === 0) {
          throw new Error("No valid items found in Excel file");
        }

        // Add new items to existing inventory
        if (!brand) {
          setUploadError("Brand data not loaded");
          return;
        }
        
        const existingItems = brand.inventory?.items || [];
        setBrand({
          ...brand,
          inventory: {
            ...brand.inventory!,
            items: [...existingItems, ...newItems]
          }
        });

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to parse Excel file";
        setUploadError(message);
        console.error("Excel upload error:", err);
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError("Failed to read file");
      setUploading(false);
    };

    reader.readAsBinaryString(file);
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Brand: {brand.name || slug}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.open(`/c/${slug}`, "_blank")}>Open /c/{slug}</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["inventory"]} className="space-y-3">
          <AccordionItem value="inventory" className="border border-border rounded-lg bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-lg font-semibold">Inventory Management</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
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
                  <div className="mt-4 space-y-3">
                    <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-card/95 backdrop-blur border-b border-border flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium text-sm">Items ({brand.inventory?.items?.length ?? 0})</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Excel
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newItem: InventoryItem = {
                              id: `item-${Date.now()}`,
                              name: "",
                              price: 0,
                              costPrice: 0,
                              quantity: 0,
                            };
                            setBrand({
                              ...brand,
                              inventory: {
                                ...brand.inventory!,
                                items: [...(brand.inventory?.items || []), newItem],
                              },
                            });
                          }}
                        >
                          + Add row
                        </Button>
                        <Button size="sm" onClick={onSave} disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelUpload}
                        className="hidden"
                        id="excel-upload"
                        aria-label="Upload inventory Excel file"
                        aria-hidden="true"
                        disabled={uploading}
                      />
                    </div>

                    {uploadError && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{uploadError}</span>
                        <Button variant="ghost" size="sm" onClick={() => setUploadError(null)}>×</Button>
                      </div>
                    )}

                    <details className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                      <summary className="cursor-pointer font-medium text-foreground">Excel column format</summary>
                      <p className="mt-2 pb-1">
                        Columns: <strong>Name</strong>, <strong>Price</strong>, optional Quantity, Description, SKU, Image URL, Half/Quarter (yes/no).
                      </p>
                    </details>

                    <div className="overflow-auto max-h-[min(70vh,560px)] rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60 sticky top-0">
                          <tr className="text-left text-muted-foreground">
                            <th className="p-2 font-medium min-w-[140px]">Name</th>
                            <th className="p-2 font-medium w-24">Price ₵</th>
                            <th className="p-2 font-medium w-24">½ ₵</th>
                            <th className="p-2 font-medium w-24">¼ ₵</th>
                            <th className="p-2 font-medium w-24">Cost ₵</th>
                            <th className="p-2 font-medium w-20">Stock</th>
                            <th className="p-2 font-medium w-16 text-center" title="Sell by half and quarter">½/¼</th>
                            <th className="p-2 font-medium min-w-[88px]">SKU</th>
                            <th className="p-2 font-medium w-10" />
                          </tr>
                        </thead>
                        <tbody>
                          {(brand.inventory?.items?.length ?? 0) === 0 && (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-muted-foreground">
                                No items yet. Click &quot;+ Add row&quot; or upload Excel.
                              </td>
                            </tr>
                          )}
                          {brand.inventory?.items?.map((item, index) => (
                            <tr key={item.id} className="border-t border-border align-top hover:bg-muted/20">
                              <td className="p-2">
                                <input
                                  className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                  value={item.name}
                                  onChange={(e) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, name: e.target.value };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                  placeholder="Item name"
                                />
                              </td>
                              <td className="p-2">
                                <EmptyZeroNumberInput
                                  id={`price-${item.id}`}
                                  value={item.price}
                                  step="0.01"
                                  min="0"
                                  className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                  aria-label="Item price in Ghana cedis"
                                  onChange={(price) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, price };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                />
                              </td>
                              <td className="p-2">
                                <EmptyZeroNumberInput
                                  id={`half-price-${item.id}`}
                                  value={item.halfPrice ?? 0}
                                  step="0.01"
                                  min="0"
                                  className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                  aria-label="Item half price in Ghana cedis"
                                  onChange={(halfPrice) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, halfPrice };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                />
                              </td>
                              <td className="p-2">
                                <EmptyZeroNumberInput
                                  id={`quarter-price-${item.id}`}
                                  value={item.quarterPrice ?? 0}
                                  step="0.01"
                                  min="0"
                                  className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                  aria-label="Item quarter price in Ghana cedis"
                                  onChange={(quarterPrice) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, quarterPrice };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                />
                              </td>
                              <td className="p-2">
                                <EmptyZeroNumberInput
                                  id={`cost-price-${item.id}`}
                                  value={item.costPrice ?? 0}
                                  step="0.01"
                                  min="0"
                                  className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                  aria-label="Item cost price in Ghana cedis"
                                  onChange={(costPrice) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, costPrice };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                />
                              </td>
                              <td className="p-2">
                                <EmptyZeroNumberInput
                                  id={`quantity-${item.id}`}
                                  value={item.quantity}
                                  min="0"
                                  integer
                                  className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                  aria-label="Item quantity in stock"
                                  onChange={(quantity) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, quantity };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={!!item.allowHalfQuarter}
                                  aria-label={`Allow half and quarter sales for ${item.name || "item"}`}
                                  onChange={(e) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, allowHalfQuarter: e.target.checked };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  className="w-full px-2 py-1.5 rounded border border-border bg-background"
                                  value={item.sku || ""}
                                  onChange={(e) => {
                                    const items = [...(brand.inventory?.items || [])];
                                    items[index] = { ...item, sku: e.target.value };
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                  placeholder="SKU"
                                />
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive h-8 px-2"
                                  onClick={() => {
                                    const items = (brand.inventory?.items || []).filter((_, i) => i !== index);
                                    setBrand({ ...brand, inventory: { ...brand.inventory!, items } });
                                  }}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Check ½/¼ for items you sell by portion (half or quarter). Optional description and image URL can be added via Excel import.
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="general" className="border border-border rounded-lg bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-lg font-semibold">General</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <label htmlFor="sales-dashboard-mode" className="text-sm font-medium">Sales dashboard focus</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable a sales-focused dashboard layout for this brand/company.
                  </p>
                </div>
                <input
                  id="sales-dashboard-mode"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!brand.salesDashboardMode}
                  onChange={(e) => setBrand({ ...brand, salesDashboardMode: e.target.checked })}
                />
              </div>
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="whatsapp" className="border border-border rounded-lg bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-lg font-semibold">WhatsApp</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="colors" className="border border-border rounded-lg bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-lg font-semibold">Colors</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="assets" className="border border-border rounded-lg bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-lg font-semibold">Assets</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payments" className="border border-border rounded-lg bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-lg font-semibold">Payments</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
              <p className="text-sm font-medium">Payment methods</p>
              <p className="text-xs text-muted-foreground">
                Only enabled methods appear at checkout. Configure keys/wallets below before turning each on.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <label htmlFor="brand-payment-mobile-enabled" className="text-sm text-muted-foreground">
                  Enable Mobile Money
                  {!brand.payment?.paystackPublicKey && (
                    <span className="block text-xs text-amber-600 dark:text-amber-500">Add Paystack key first</span>
                  )}
                </label>
                <input
                  id="brand-payment-mobile-enabled"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!brand.payment?.mobileMoneyEnabled}
                  disabled={!brand.payment?.paystackPublicKey}
                  onChange={(e) => setBrand({
                    ...brand,
                    payment: { ...(brand.payment || {}), mobileMoneyEnabled: e.target.checked }
                  })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <label htmlFor="brand-payment-crypto-enabled" className="text-sm text-muted-foreground">
                  Enable Crypto
                  {!brand.payment?.receiver && (
                    <span className="block text-xs text-amber-600 dark:text-amber-500">Add wallet address first</span>
                  )}
                </label>
                <input
                  id="brand-payment-crypto-enabled"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!brand.payment?.cryptoEnabled}
                  disabled={!brand.payment?.receiver}
                  onChange={(e) => setBrand({
                    ...brand,
                    payment: { ...(brand.payment || {}), cryptoEnabled: e.target.checked }
                  })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <label htmlFor="brand-payment-cash-enabled" className="text-sm text-muted-foreground">Enable Cash</label>
                <input
                  id="brand-payment-cash-enabled"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!brand.payment?.cashEnabled}
                  onChange={(e) => setBrand({
                    ...brand,
                    payment: { ...(brand.payment || {}), cashEnabled: e.target.checked }
                  })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <label htmlFor="brand-payment-skip-payments" className="text-sm text-muted-foreground">
                  Manual mobile money recording
                  <span className="block text-xs text-muted-foreground font-normal">Record sale without Paystack popup</span>
                </label>
                <input
                  id="brand-payment-skip-payments"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!brand.payment?.skipPayments}
                  disabled={!brand.payment?.mobileMoneyEnabled}
                  onChange={(e) => setBrand({
                    ...brand,
                    payment: { ...(brand.payment || {}), skipPayments: e.target.checked }
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <label htmlFor="brand-payment-receiver" className="text-sm text-muted-foreground">Crypto Receiver (wallet)</label>
              <input
                id="brand-payment-receiver"
                className="w-full px-3 py-2 rounded border border-border bg-background font-mono"
                value={brand.payment?.receiver || ""}
                onChange={(e) => setBrand({
                  ...brand,
                  payment: {
                    ...(brand.payment || {}),
                    receiver: e.target.value,
                    ...(e.target.value ? {} : { cryptoEnabled: false }),
                  }
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
                  payment: {
                    ...(brand.payment || {}),
                    paystackPublicKey: e.target.value,
                    ...(e.target.value ? {} : { mobileMoneyEnabled: false, skipPayments: false }),
                  }
                })}
                placeholder="pk_live_xxx or pk_test_xxx"
              />
            </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="meta" className="border border-border rounded-lg bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="text-lg font-semibold">Meta</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>
    </div>
  );
}
