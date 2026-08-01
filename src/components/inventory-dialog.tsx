"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minStock?: number;
  price?: number;
  category?: string;
}

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: {
    items?: InventoryItem[];
  };
}

export function InventoryDialog({ open, onOpenChange, inventory }: InventoryDialogProps) {
  const items = inventory?.items || [];
  const totalStock = items.reduce((total, item) => total + (item.quantity || 0), 0);
  const lowStockItems = items.filter(item => item.minStock && item.quantity <= item.minStock);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock On Hand Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              </div>
              <p className="text-2xl font-bold">{totalStock}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {lowStockItems.length > 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              </div>
              <p className="text-2xl font-bold">{lowStockItems.length}</p>
            </div>
          </div>

          {/* Inventory Table */}
          {items.length > 0 ? (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Item Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold text-right">Quantity</TableHead>
                    <TableHead className="font-semibold text-right">Min Stock</TableHead>
                    <TableHead className="font-semibold text-right">Price</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isLowStock = item.minStock && item.quantity <= item.minStock;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.category || "N/A"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.minStock || "N/A"}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.price ? `$${item.price.toFixed(2)}` : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={isLowStock ? "destructive" : "default"}
                            className={isLowStock ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}
                          >
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inventory items found</p>
            </div>
          )}

          {/* Low Stock Warning */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                <TrendingDown className="h-4 w-4" />
                <p className="font-semibold">Low Stock Alert</p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                {lowStockItems.length} item(s) are at or below minimum stock level. Consider restocking soon.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
