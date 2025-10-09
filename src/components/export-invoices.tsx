"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface ExportInvoicesProps {
  invoices: unknown[];
  className?: string;
}

interface InvoiceData {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  status: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  paidAt?: string;
  reference?: string;
  transactionId?: string;
  chainId?: number;
  tokenSymbol?: string;
  usdValue?: string;
}

export function ExportInvoices({ invoices, className }: ExportInvoicesProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | null>(null);

  const normalizeInvoiceData = (invoice: unknown): InvoiceData => {
    try {
      const inv = invoice as Record<string, unknown>;
      if (inv.paymentMethod === "mobile_money") {
        const metadata = inv.metadata as Record<string, unknown> | undefined;
        const customer = inv.customer as Record<string, unknown> | undefined;
        
        return {
          id: (inv.id as string) || "N/A",
          title: (inv.title as string) || "N/A",
          description: (inv.description as string) || "N/A",
          amount: (metadata?.original_amount as number)?.toString() || "0",
          currency: (metadata?.original_currency as string) || "N/A",
          paymentMethod: "Mobile Money",
          status: "Paid",
          customerName: (metadata?.customer_name as string) || (inv.title as string) || "N/A",
          customerEmail: (customer?.email as string) || "N/A",
          customerPhone: (metadata?.phone_number as string) || "N/A",
          createdAt: (inv.createdAt as string) || new Date().toISOString(),
          paidAt: (inv.paid_at as string) || "N/A",
          reference: (inv.reference as string) || "N/A",
          transactionId: (metadata?.paystack_transaction_id as number)?.toString() || "N/A",
          chainId: undefined,
          tokenSymbol: undefined,
          usdValue: undefined,
        };
      } else {
        // Crypto payment
        const destinationToken = inv.destinationToken as Record<string, unknown> | undefined;
        const decimals = (destinationToken?.decimals as number) || 18;
        const amount = parseFloat((inv.amount as string) || "0") / Math.pow(10, decimals);
        
        return {
          id: (inv.id as string) || "N/A",
          title: (inv.title as string) || "N/A",
          description: (inv.description as string) || "N/A",
          amount: amount.toFixed(6),
          currency: (destinationToken?.symbol as string) || "N/A",
          paymentMethod: `Crypto (Chain ${destinationToken?.chainId || "N/A"})`,
          status: "Paid", // Assuming crypto payments are paid when they appear
          customerName: (inv.title as string) || "N/A", // Using title as customer name for crypto
          customerEmail: "N/A",
          customerPhone: "N/A",
          createdAt: (inv.createdAt as string) || new Date().toISOString(),
          paidAt: (inv.createdAt as string) || new Date().toISOString(), // Assuming paid when created
          reference: (inv.id as string) || "N/A",
          transactionId: (inv.id as string) || "N/A",
          chainId: destinationToken?.chainId as number | undefined,
          tokenSymbol: destinationToken?.symbol as string | undefined,
          usdValue: inv.priceUsd ? (amount * (inv.priceUsd as number)).toFixed(2) : "N/A",
        };
      }
    } catch (error) {
      console.error("Error normalizing invoice data:", error, invoice);
      // Return a safe default
      const inv = invoice as Record<string, unknown>;
      return {
        id: (inv.id as string) || "N/A",
        title: (inv.title as string) || "N/A",
        description: "Error processing invoice",
        amount: "0",
        currency: "N/A",
        paymentMethod: "Unknown",
        status: "Error",
        customerName: "N/A",
        customerEmail: "N/A",
        customerPhone: "N/A",
        createdAt: new Date().toISOString(),
        paidAt: "N/A",
        reference: "N/A",
        transactionId: "N/A",
        chainId: undefined,
        tokenSymbol: undefined,
        usdValue: undefined,
      };
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      console.log("Starting CSV export with", invoices.length, "invoices");
      const normalizedData = invoices.map(normalizeInvoiceData);
      console.log("Normalized data:", normalizedData);
      
      // CSV headers and their corresponding data keys
      const csvFields = [
        { header: "Invoice ID", key: "id" },
        { header: "Title", key: "title" },
        { header: "Description", key: "description" },
        { header: "Amount", key: "amount" },
        { header: "Currency", key: "currency" },
        { header: "Payment Method", key: "paymentMethod" },
        { header: "Status", key: "status" },
        { header: "Customer Name", key: "customerName" },
        { header: "Customer Email", key: "customerEmail" },
        { header: "Customer Phone", key: "customerPhone" },
        { header: "Created Date", key: "createdAt" },
        { header: "Paid Date", key: "paidAt" },
        { header: "Reference", key: "reference" },
        { header: "Transaction ID", key: "transactionId" },
        { header: "Chain ID", key: "chainId" },
        { header: "Token Symbol", key: "tokenSymbol" },
        { header: "USD Value", key: "usdValue" }
      ];

      // Helper function to escape CSV values
      const escapeCSVValue = (value: unknown): string => {
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Convert data to CSV format
      const csvContent = [
        csvFields.map(field => field.header).join(","),
        ...normalizedData.map(row => 
          csvFields.map(field => escapeCSVValue(row[field.key as keyof InvoiceData])).join(",")
        )
      ].join("\n");

      console.log("CSV content preview:", csvContent.substring(0, 500) + "...");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `invoices-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV file");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Dynamic import for XLSX
      const XLSX = await import("xlsx");
      
      const normalizedData = invoices.map(normalizeInvoiceData);
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Prepare data for Excel with proper formatting
      const excelData = normalizedData.map(row => ({
        "Invoice ID": row.id,
        "Title": row.title,
        "Description": row.description || "",
        "Amount": row.amount ? parseFloat(row.amount) : 0,
        "Currency": row.currency || "",
        "Payment Method": row.paymentMethod,
        "Status": row.status,
        "Customer Name": row.customerName || "",
        "Customer Email": row.customerEmail || "",
        "Customer Phone": row.customerPhone || "",
        "Created Date": new Date(row.createdAt).toLocaleDateString(),
        "Paid Date": row.paidAt ? new Date(row.paidAt).toLocaleDateString() : "",
        "Reference": row.reference || "",
        "Transaction ID": row.transactionId || "",
        "Chain ID": row.chainId || "",
        "Token Symbol": row.tokenSymbol || "",
        "USD Value": row.usdValue && row.usdValue !== "N/A" ? parseFloat(row.usdValue) : "",
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Invoice ID
        { wch: 25 }, // Title
        { wch: 30 }, // Description
        { wch: 15 }, // Amount
        { wch: 10 }, // Currency
        { wch: 20 }, // Payment Method
        { wch: 10 }, // Status
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Customer Email
        { wch: 15 }, // Customer Phone
        { wch: 12 }, // Created Date
        { wch: 12 }, // Paid Date
        { wch: 20 }, // Reference
        { wch: 15 }, // Transaction ID
        { wch: 10 }, // Chain ID
        { wch: 15 }, // Token Symbol
        { wch: 12 }, // USD Value
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Invoices");

      // Generate and download file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `invoices-${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Failed to export Excel file");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const handleExport = (format: "csv" | "excel") => {
    setExportFormat(format);
    if (format === "csv") {
      exportToCSV();
    } else {
      exportToExcel();
    }
  };

  if (invoices.length === 0) {
    return (
      <Button variant="outline" className={className} disabled>
        <Download className="h-4 w-4 mr-2" />
        Export (0)
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export ({invoices.length})
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Export Invoices</h3>
            <p className="text-sm text-muted-foreground">
              Export {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} to your preferred format
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Card 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => !isExporting && handleExport("csv")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">CSV Format</h4>
                    <p className="text-sm text-muted-foreground">
                      Comma-separated values, compatible with Excel and Google Sheets
                    </p>
                  </div>
                  {exportFormat === "csv" && isExporting && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => !isExporting && handleExport("excel")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">Excel Format</h4>
                    <p className="text-sm text-muted-foreground">
                      Native Excel format with formatting and formulas
                    </p>
                  </div>
                  {exportFormat === "excel" && isExporting && (
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total invoices: {invoices.length}</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {invoices.filter(inv => (inv as Record<string, unknown>).paymentMethod === "mobile_money").length} Mobile Money
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {invoices.filter(inv => (inv as Record<string, unknown>).paymentMethod !== "mobile_money").length} Crypto
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
