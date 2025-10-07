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
      
      // Create a simple PDF first to test
      const pdf = new jsPDF();
      
      // Add basic content
      pdf.setFontSize(20);
      pdf.text('INVOICE', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Invoice ID: ${invoice.id}`, 20, 40);
      pdf.text(`Reference: ${invoice.reference}`, 20, 50);
      pdf.text(`Amount: ${invoice.metadata.original_amount} ${invoice.metadata.original_currency}`, 20, 60);
      pdf.text(`Customer: ${invoice.metadata.customer_name || 'N/A'}`, 20, 70);
      pdf.text(`Paid: ${formatDate(invoice.paid_at)}`, 20, 80);
      
      // Save the PDF
      const fileName = `invoice-${invoice.reference}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF with filename:', fileName);
      pdf.save(fileName);
      
      console.log('PDF generated successfully');

    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        invoice: invoice
      });
      alert(`Failed to generate PDF: ${error.message}`);
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
