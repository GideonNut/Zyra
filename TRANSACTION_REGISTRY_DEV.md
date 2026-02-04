# TransactionRegistry - Technical Overview

> **For developers only** - Users don't need to do anything. All recording happens automatically.

## What's Happening Behind the Scenes

Every payment (mobile money or crypto) is automatically recorded on the Lisk blockchain via the TransactionRegistry smart contract.

### Automatic Flows

#### Mobile Money (Paystack)
1. Customer initiates payment in payment form
2. Paystack processes payment
3. Frontend calls `/api/paystack/verify`
4. Backend verifies with Paystack
5. **Automatically:** Transaction recorded to Lisk registry
6. **Automatically:** Invoice created in Firebase
7. **Automatically:** WhatsApp notification sent

#### Crypto (Thirdweb)
1. Customer creates crypto payment link
2. Customer scans QR and pays via Thirdweb
3. **Webhook endpoint:** `/api/webhooks/thirdweb-payment`
4. **Automatically:** Transaction recorded to Lisk registry
5. **Automatically:** Invoice created in Firebase  
6. **Automatically:** WhatsApp notification sent

### Code Structure

**Services (No manual setup needed):**
- `src/lib/transaction-registry.ts` - Lisk contract interaction
- `src/lib/transaction-recorder.ts` - Transaction recording utilities

**API Endpoints (Automatic):**
- `src/app/api/paystack/verify/route.ts` - Records Paystack transactions
- `src/app/api/webhooks/thirdweb-payment/route.ts` - Records crypto transactions
- `src/app/api/transaction-registry/route.ts` - Query API for developers

**React Hooks (Optional for queries):**
- `src/hooks/useTransactionRegistry.ts` - Query recorded transactions
- `src/hooks/usePaymentTracking.ts` - Track payment state

## Configuration

Everything is pre-configured with defaults:
- Contract address: `0x00FE619DD3d5cd516DEC65A629823fc557A6eA9a`
- Network: Lisk Mainnet (1135)
- RPC: `https://rpc.mainnet.lisk.com`

No environment variables needed - it just works.

## Troubleshooting for Developers

**Transactions not recording?**
- Check server logs: `recordTransactionToRegistry` function
- Verify Paystack/Thirdweb payment succeeded
- Check Firebase invoice creation logs
- Current implementation logs to console (graceful degradation)

**API Query Issues?**
- Ensure payment was marked as successful
- Transaction IDs are 1-based
- Merchant addresses are checksummed addresses

**Webhook Not Firing?**
- Configure Thirdweb dashboard with webhook URL
- Verify endpoint returns 200 status
- Check request headers and body format

## Monitoring

Transactions are visible at:
- **On-chain:** https://liskscan.com/address/0x00FE619DD3d5cd516DEC65A629823fc557A6eA9a
- **Invoices:** Firebase `invoices` collection
- **Logs:** Server console output

## Future Enhancements

Possible improvements (not required):
- Real contract signing instead of mock recording
- Transaction status updates via smart contract
- Refund tracking and processing
- Automated settlement verification
