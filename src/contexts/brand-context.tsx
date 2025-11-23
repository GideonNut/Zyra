"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  imageUrl?: string;
}

export type Brand = {
  id: string;
  name: string;
  colors?: {
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
    accent?: string;
    accentForeground?: string;
    foreground?: string;
    background?: string;
    darkForeground?: string;
    darkBackground?: string;
  };
  assets?: {
    logo?: { light?: string; dark?: string };
    favicon?: string;
  };
  meta?: { title?: string; description?: string };
  payment?: {
    receiver?: string;
    paystackPublicKey?: string;
  };
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

interface BrandContextType {
  brand?: Brand;
  slug?: string;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

function applyCssVars(colors?: Brand["colors"]) {
  if (!colors) return;
  const root = document.documentElement;
  const entries: Array<[string, string | undefined]> = [
    ["--primary", colors.primary],
    ["--primary-foreground", colors.primaryForeground],
    ["--secondary", colors.secondary],
    ["--secondary-foreground", colors.secondaryForeground],
    ["--accent", colors.accent],
    ["--accent-foreground", colors.accentForeground],
    ["--foreground", colors.foreground],
    ["--background", colors.background],
  ];
  for (const [k, v] of entries) {
    if (v) root.style.setProperty(k, v);
  }
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [brand, setBrand] = useState<Brand | undefined>(undefined);

  const slug = useMemo(() => {
    if (!pathname) return undefined;
    const parts = pathname.split("/").filter(Boolean);
    // Use '/c/<company>' as the brand path to avoid root dynamic conflicts
    if (parts.length >= 2 && parts[0] === "c") return parts[1];
    return undefined;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!slug) {
          setBrand(undefined);
          return;
        }
        // Load static brand json from public/brands/<slug>/brand.json
        const res = await fetch(`/brands/${slug}/brand.json`, { cache: "no-store" });
        if (!res.ok) {
          setBrand(undefined);
          return;
        }
        const data: Brand = await res.json();
        if (!cancelled) setBrand(data);
      } catch {
        if (!cancelled) setBrand(undefined);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    applyCssVars(brand?.colors);
  }, [brand]);

  const value = useMemo(() => ({ brand, slug }), [brand, slug]);
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
