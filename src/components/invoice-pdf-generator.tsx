'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { MobileMoneyInvoice } from '@/lib/invoice-storage';

interface InvoicePDFGeneratorProps {
  invoice: MobileMoneyInvoice;
  className?: string;
}

export function InvoicePDFGenerator({ invoice, className }: InvoicePDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting PDF generation...');
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with proper spacing
      const addText = (text: string, x: number, y: number, fontSize = 12, style: 'normal' | 'bold' = 'normal') => {
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, style);
        pdf.text(text, x, y);
        return y + (fontSize * 0.4) + 2; // Return next Y position
      };

      // Helper function to add section header
      const addSectionHeader = (text: string, y: number) => {
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(31, 41, 55); // Dark gray
        pdf.text(text, margin, y);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(229, 231, 235); // Light gray line
        pdf.line(margin, y + 2, margin + contentWidth, y + 2);
        return y + 10;
      };

      // Header with background
      pdf.setFillColor(31, 41, 55); // Dark gray background
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      pdf.setTextColor(255, 255, 255); // White text
      yPosition = addText('INVOICE', margin, 25, 24, 'bold');
      pdf.setFontSize(12);
      pdf.text('Payment Receipt', margin, yPosition + 2);
      
      yPosition = margin + 50;
      pdf.setTextColor(0, 0, 0); // Black text

      // Invoice Details Section
      yPosition = addSectionHeader('Invoice Details', yPosition);
      
      yPosition = addText(`Invoice ID: ${invoice.id}`, margin, yPosition);
      yPosition = addText(`Reference: ${invoice.reference}`, margin, yPosition);
      yPosition = addText(`Payment Method: Mobile Money`, margin, yPosition);
      yPosition = addText(`Created: ${formatDate(invoice.createdAt)}`, margin, yPosition);
      yPosition = addText(`Paid: ${formatDate(invoice.paid_at)}`, margin, yPosition);

      // Amount Section (right side)
      const amountX = margin + 100;
      yPosition = margin + 50;
      pdf.setTextColor(5, 150, 105); // Green text
      yPosition = addText(`${invoice.metadata.original_amount} ${invoice.metadata.original_currency}`, amountX, yPosition, 18, 'bold');
      pdf.setTextColor(107, 114, 128); // Gray text
      pdf.setFontSize(12);
      pdf.text('Total Paid', amountX, yPosition + 2);

      yPosition = margin + 100;
      pdf.setTextColor(0, 0, 0); // Black text

      // Customer Information Section
      yPosition = addSectionHeader('Customer Information', yPosition);
      
      yPosition = addText(`Name: ${invoice.metadata.customer_name || 'N/A'}`, margin, yPosition);
      yPosition = addText(`Email: ${invoice.customer.email || 'N/A'}`, margin, yPosition);
      yPosition = addText(`Phone: ${invoice.metadata.phone_number || 'N/A'}`, margin, yPosition);
      yPosition = addText(`Customer ID: ${invoice.customer.id || 'N/A'}`, margin, yPosition);

      // Payment Details Section
      yPosition += 10;
      yPosition = addSectionHeader('Payment Details', yPosition);
      
      yPosition = addText(`Title: ${invoice.title}`, margin, yPosition);
      yPosition = addText(`Description: ${invoice.description}`, margin, yPosition);
      yPosition = addText(`Transaction ID: ${invoice.metadata.paystack_transaction_id}`, margin, yPosition);
      yPosition = addText(`Paystack Reference: ${invoice.metadata.paystack_reference}`, margin, yPosition);

      // Payment Status Box
      yPosition += 15;
      pdf.setFillColor(220, 252, 231); // Light green background
      pdf.rect(margin, yPosition, contentWidth, 25, 'F');
      pdf.setDrawColor(187, 247, 208); // Light green border
      pdf.setLineWidth(1);
      pdf.rect(margin, yPosition, contentWidth, 25, 'S');
      
      pdf.setTextColor(22, 101, 52); // Dark green text
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Payment Successful', margin + 10, yPosition + 15);
      
      pdf.setTextColor(21, 128, 61); // Medium green text
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text('This invoice has been paid successfully', margin + 10, yPosition + 20);

      // Footer
      yPosition = pageHeight - 30;
      pdf.setTextColor(107, 114, 128); // Gray text
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, margin, yPosition);
      pdf.text('Thank you for your payment!', margin, yPosition + 5);

      // Save the PDF
      const fileName = `invoice-${invoice.reference}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF generated successfully');

    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        invoice: invoice
      });
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}
