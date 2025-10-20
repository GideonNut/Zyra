"use client";

import { useEffect } from "react";
import { useBrand } from "@/contexts/brand-context";
import { useTheme } from "@/contexts/theme-context";

export function BrandHeadClient() {
  const { brand } = useBrand();
  const { theme } = useTheme();

  useEffect(() => {
    if (!brand) return;
    if (brand.meta?.title) {
      document.title = brand.meta.title;
    }
    const linkId = "dynamic-favicon";
    let link = document.querySelector<HTMLLinkElement>(`link#${linkId}`);
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "icon";
      document.head.appendChild(link);
    }
    if (brand.assets?.favicon) {
      link.href = brand.assets.favicon;
    }
  }, [brand, theme]);

  return null;
}
