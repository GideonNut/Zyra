"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Badge } from "./badge";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { CalendarIcon, Filter, X, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  status: string[];
  paymentMethod: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  amountRange: {
    min: string;
    max: string;
  };
  customer: string;
}

interface AdvancedFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
  { value: "unpaid", label: "Unpaid", color: "bg-yellow-100 text-yellow-800" },
  { value: "pending", label: "Pending", color: "bg-blue-100 text-blue-800" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "mobile_money", label: "Mobile Money", icon: "📱" },
  { value: "crypto", label: "Crypto", icon: "₿" },
];

export function AdvancedFilter({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  className 
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter("status", newStatus);
  };

  const togglePaymentMethod = (method: string) => {
    const newMethods = filters.paymentMethod.includes(method)
      ? filters.paymentMethod.filter(m => m !== method)
      : [...filters.paymentMethod, method];
    updateFilter("paymentMethod", newMethods);
  };

  const activeFiltersCount = 
    filters.search.length +
    filters.status.length +
    filters.paymentMethod.length +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.amountRange.min || filters.amountRange.max ? 1 : 0) +
    (filters.customer.length ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search invoices by title, customer, or description..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearFilters();
                    setIsOpen(false);
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>

              {/* Customer Filter */}
              <div className="space-y-2">
                <Label>Customer</Label>
                <Input
                  placeholder="Filter by customer name..."
                  value={filters.customer}
                  onChange={(e) => updateFilter("customer", e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <Button
                      key={status.value}
                      variant={filters.status.includes(status.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleStatus(status.value)}
                      className={cn(
                        "h-8",
                        filters.status.includes(status.value) && status.color
                      )}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHOD_OPTIONS.map((method) => (
                    <Button
                      key={method.value}
                      variant={filters.paymentMethod.includes(method.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePaymentMethod(method.value)}
                      className="h-8"
                    >
                      <span className="mr-1">{method.icon}</span>
                      {method.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal h-8",
                          !filters.dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? (
                          format(filters.dateRange.from, "MMM dd")
                        ) : (
                          "From"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => 
                          updateFilter("dateRange", { 
                            ...filters.dateRange, 
                            from: date 
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal h-8",
                          !filters.dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? (
                          format(filters.dateRange.to, "MMM dd")
                        ) : (
                          "To"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => 
                          updateFilter("dateRange", { 
                            ...filters.dateRange, 
                            to: date 
                          })
                        }
                        disabled={(date) => 
                          filters.dateRange.from ? date < filters.dateRange.from : false
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Amount Range Filter */}
              <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min amount"
                    value={filters.amountRange.min}
                    onChange={(e) => 
                      updateFilter("amountRange", { 
                        ...filters.amountRange, 
                        min: e.target.value 
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max amount"
                    value={filters.amountRange.max}
                    onChange={(e) => 
                      updateFilter("amountRange", { 
                        ...filters.amountRange, 
                        max: e.target.value 
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1 ml-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("search", "")}
                />
              </Badge>
            )}
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                {STATUS_OPTIONS.find(s => s.value === status)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleStatus(status)}
                />
              </Badge>
            ))}
            {filters.paymentMethod.map(method => (
              <Badge key={method} variant="secondary" className="gap-1">
                {PAYMENT_METHOD_OPTIONS.find(m => m.value === method)?.icon}
                {PAYMENT_METHOD_OPTIONS.find(m => m.value === method)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => togglePaymentMethod(method)}
                />
              </Badge>
            ))}
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="secondary" className="gap-1">
                Date: {filters.dateRange.from && format(filters.dateRange.from, "MMM dd")}
                {filters.dateRange.from && filters.dateRange.to && " - "}
                {filters.dateRange.to && format(filters.dateRange.to, "MMM dd")}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("dateRange", { from: undefined, to: undefined })}
                />
              </Badge>
            )}
            {(filters.amountRange.min || filters.amountRange.max) && (
              <Badge variant="secondary" className="gap-1">
                Amount: {filters.amountRange.min || "0"} - {filters.amountRange.max || "∞"}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("amountRange", { min: "", max: "" })}
                />
              </Badge>
            )}
            {filters.customer && (
              <Badge variant="secondary" className="gap-1">
                Customer: {filters.customer}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("customer", "")}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
