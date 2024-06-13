

# Transactions 

## creating api

### cip66

The new transaction type for paying for gas in fee currencies cip66. 
the TLDR is it denominiate fees in CELO instead of FeeToken, which makes is behavior 
much more like eip1559 transactions. maxFeePerGas/MaxPriorityFee can now be calculated / built the exact same way as eip1559 transactions. But it has an additional field `maxFeePerFeeCurrency` which serves as the limit / a hedge against exchange rate risk. as the transaction is "billed" in native celo but paid in the fee token. 


```typescript

// Explicitly 
// here the sender / dev must calculate the maxFeePerFeeCurrency by hand  
// this is what https://github.com/celo-org/viem/pull/13 enables 
sendTransaction({
    ...typicalEIP1559TransactionParams,
    feeCurrency: '0xTokenAddress',
    maxFeePerFeeCurrency: 10000000n,
})


// Implicitly
// Today this creates a cip64 transaction, eventually we'd like it to default
// to creating a cip66 by calculating maxFeePerFeeCurrency for the user
// this requires knowing and multiply together 
// the maxFeePerGas, the gasLimit, and the exchange rate of CELO to feeToken. 
sendTransaction({
    ...typicalEIP1559TransactionParams,
    feeCurrency: '0xTokenAddress',
})
```

### op deposit transactions

finally add the ability to serialize deposit transactions.

```typescript
sendTransaction({
    from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
    sourceHash:
    '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
    type: 'deposit'
})

```

this is of course not the same as actually building a deposit transaction, which would be part of celo inclusion in op-stack extensions. 


## reading api

The changes here are minimal and it come down to 

1. dont add properties to transactions which dont exist on those transactions (ie `feeCurrency` was added to all transactions in returned from rpc despite only existing on the source in a few)

2. add maxFeePerGas as optional property when it is on the args.


`maxFeeInFeeCurrency?: bigint`
`feeCurrency?: Address | undefined` // instead of or in addition to `null`.

