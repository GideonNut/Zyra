# TransactionRegistry

All your payments are automatically recorded on the Lisk blockchain for complete transparency and audit trail.

**Everything is automatic — no setup or user action needed.**

## What Happens Automatically

When a payment is processed (mobile money or crypto):

✅ Transaction recorded on Lisk mainnet  
✅ Unique verification reference created  
✅ Status tracked (Recorded → Settled)  
✅ Invoice created with on-chain confirmation  
✅ All data immutable and verifiable  

## View Your Transactions

Your transactions appear automatically in your invoice records with blockchain confirmation.

To view all transactions on the blockchain:  
**Explorer:** https://liskscan.com/address/0x00FE619DD3d5cd516DEC65A629823fc557A6eA9a

## How It Works

### Mobile Money Payments
```
Customer Pays → Paystack → Automatically Recorded on Lisk
```

### Crypto Payments
```
Customer Pays → Thirdweb → Automatically Recorded on Lisk
```

## Transaction Details

Each recorded transaction includes:
- Merchant wallet address
- Payer address
- Amount and currency
- Unique reference hash
- Timestamp
- Status (Recorded/Settled/Refunded)

## Query API

Get transaction details programmatically:

```
GET /api/transaction-registry?id=1
GET /api/transaction-registry?merchant=0xAddress
```

## Blockchain Details

- **Network:** Lisk Mainnet (1135)
- **Contract:** `0x00FE619DD3d5cd516DEC65A629823fc557A6eA9a`
- **Explorer:** https://liskscan.com

## Why This Matters

Your transactions are:
- **Permanent** - Recorded on Lisk blockchain forever
- **Verifiable** - Can be checked by anyone
- **Immutable** - Cannot be altered or deleted
- **Transparent** - Complete audit trail

Everything works automatically behind the scenes. Your payments are always recorded and verifiable.
