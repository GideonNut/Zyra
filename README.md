# Zyra

See the live app at https://myzyra.vercel.app/

Create professional invoices that accept both crypto and mobile money payments with instant tracking and management.

## What it does

Zyra is a comprehensive invoice management platform that supports multiple payment methods:

- **Crypto Payments**: Accept payments in various cryptocurrencies across multiple chains
- **Mobile Money**: Accept mobile money payments through Paystack integration
- **Invoice Management**: Track all payments in a unified dashboard
- **QR Code Generation**: Generate shareable QR codes for instant payments
- **Real-time Tracking**: Monitor payment status and invoice history

## How it works

### For Crypto Payments:
1. Connect your wallet
2. Create an invoice with amount and token selection
3. Share the generated QR code or payment link
4. Client scans and pays through their wallet
5. Track payment status in your dashboard

### For Mobile Money Payments:
1. Create an invoice with customer details and amount
2. Customer receives payment link via Paystack
3. Customer completes mobile money payment
4. Payment is automatically verified and invoice created
5. Track all mobile money payments in your dashboard

## Features

- **Multi-Chain Support**: Accept payments across different blockchain networks
- **Mobile Money Integration**: Seamless Paystack integration for mobile money payments
- **Unified Dashboard**: View all invoices (crypto + mobile money) in one place
- **Real-time Statistics**: Track total invoices, paid amounts, and pending payments
- **Professional Invoices**: Generate clean, professional invoice pages
- **Payment Verification**: Automatic payment verification and invoice creation
- **Webhook Support**: Reliable payment tracking through webhooks

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Crypto Payments**: [thirdweb Payments](https://portal.thirdweb.com/payments)
- **Mobile Money**: Paystack API integration
- **Wallet Connection**: Thirdweb Connect Button
- **Storage**: File-based invoice storage system

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `THIRDWEB_SECRET_KEY`: Your Thirdweb secret key
   - `PAYSTACK_SECRET_KEY`: Your Paystack secret key
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your Paystack public key
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

```env
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Payment Methods Supported

- **Cryptocurrencies**: All tokens supported by thirdweb Payments
- **Mobile Money**: Ghana (GHS), Nigeria (NGN), and other Paystack-supported currencies
- **Cross-Chain**: Multiple blockchain networks supported

Built with modern web technologies for secure, fast, and reliable payment processing.
