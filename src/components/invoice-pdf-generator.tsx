'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { MobileMoneyInvoice } from '@/lib/invoice-storage';

interface InvoicePDFGeneratorProps {
  invoice: MobileMoneyInvoice;
  className?: string;
}

export function InvoicePDFGenerator({ invoice, className }: InvoicePDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a temporary div to render the invoice content
      const invoiceElement = document.createElement('div');
      invoiceElement.innerHTML = getInvoiceHTML(invoice);
      invoiceElement.style.cssText = `
        width: 210mm;
        padding: 20mm;
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #000;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        margin: 20px;
      `;
      
      document.body.appendChild(invoiceElement);

      // Convert to canvas
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Remove the temporary element
      document.body.removeChild(invoiceElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `invoice-${invoice.reference}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getInvoiceHTML = (invoice: MobileMoneyInvoice): string => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `
      <div style="max-width: 100%;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin: 0;">INVOICE</h1>
          <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">Payment Receipt</p>
        </div>

        <!-- Invoice Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">Invoice Details</h3>
            <p style="margin: 5px 0;"><strong>Invoice ID:</strong> ${invoice.id}</p>
            <p style="margin: 5px 0;"><strong>Reference:</strong> ${invoice.reference}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> Mobile Money</p>
            <p style="margin: 5px 0;"><strong>Created:</strong> ${formatDate(invoice.createdAt)}</p>
            <p style="margin: 5px 0;"><strong>Paid:</strong> ${formatDate(invoice.paid_at)}</p>
          </div>
          
          <div style="text-align: right;">
            <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">Amount</h3>
            <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0;">
              ${invoice.metadata.original_amount} ${invoice.metadata.original_currency}
            </p>
            <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">Total Paid</p>
          </div>
        </div>

        <!-- Customer Information -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 15px 0;">Customer Information</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${invoice.metadata.customer_name || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${invoice.customer.email || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${invoice.metadata.phone_number || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Customer Code:</strong> ${invoice.customer.id || 'N/A'}</p>
          </div>
        </div>

        <!-- Payment Details -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 15px 0;">Payment Details</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${invoice.metadata.paystack_transaction_id}</p>
            <p style="margin: 5px 0;"><strong>Paystack Reference:</strong> ${invoice.metadata.paystack_reference}</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${invoice.description}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${invoice.title}</p>
          </div>
        </div>

        <!-- Status -->
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #dcfce7; border-radius: 8px; border: 1px solid #bbf7d0;">
          <h3 style="font-size: 18px; font-weight: bold; color: #166534; margin: 0;">Payment Successful</h3>
          <p style="font-size: 14px; color: #15803d; margin: 5px 0 0 0;">This invoice has been paid successfully</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>Generated on ${new Date().toLocaleDateString('en-US')}</p>
          <p>Thank you for your payment!</p>
        </div>
      </div>
    `;
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
