import { InvalidAddressError } from '../errors/address.js'
import { BaseError } from '../errors/base.js'
import { InvalidChainIdError } from '../errors/chain.js'
import { FeeCapTooHighError, TipAboveFeeCapError } from '../errors/node.js'
import type { ChainSerializers } from '../types/chain.js'
import type { Signature } from '../types/misc.js'
import { isAddress } from '../utils/address/isAddress.js'
import { concatHex } from '../utils/data/concat.js'
import { toHex } from '../utils/encoding/toHex.js'
import { toRlp } from '../utils/encoding/toRlp.js'
import { serializeAccessList } from '../utils/transaction/serializeAccessList.js'
import {
  serializeTransaction as serializeTransaction_,
  toYParitySignatureArray,
} from '../utils/transaction/serializeTransaction.js'
import type {
  CeloTransactionSerializable,
  TransactionSerializableCIP42,
  TransactionSerializableCIP64,
  TransactionSerializableCIP66,
  TransactionSerializedCIP64,
  TransactionSerializedCIP66,
} from './types.js'
import {
  EMPTY_HEX_VALUE,
  isCIP64,
  isCIP66,
  isEmpty,
  isPresent,
} from './utils.js'

export function serializeTransaction(
  transaction: CeloTransactionSerializable,
  signature?: Signature | undefined,
) {
  if (isCIP66(transaction)) {
    return serializeTransactionCIP66(transaction, signature)
  }

  if (isCIP64(transaction)) {
    return serializeTransactionCIP64(transaction, signature)
  }

  return serializeTransaction_(transaction, signature)
}

export const serializers = {
  transaction: serializeTransaction,
} as const satisfies ChainSerializers

//////////////////////////////////////////////////////////////////////////////
// Serializers

export type SerializeTransactionCIP64ReturnType = TransactionSerializedCIP64
export type SerializeTransactionCIP66ReturnType = TransactionSerializedCIP66

function serializeTransactionCIP64(
  transaction: TransactionSerializableCIP64,
  signature?: Signature | undefined,
): SerializeTransactionCIP64ReturnType {
  assertTransactionCIP64(transaction)
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    feeCurrency,
    data,
  } = transaction

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : EMPTY_HEX_VALUE,
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : EMPTY_HEX_VALUE,
    maxFeePerGas ? toHex(maxFeePerGas) : EMPTY_HEX_VALUE,
    gas ? toHex(gas) : EMPTY_HEX_VALUE,
    to ?? EMPTY_HEX_VALUE,
    value ? toHex(value) : EMPTY_HEX_VALUE,
    data ?? EMPTY_HEX_VALUE,
    serializeAccessList(accessList),
    feeCurrency!,
    ...toYParitySignatureArray(transaction, signature),
  ]

  return concatHex([
    '0x7b',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionCIP64ReturnType
}

function serializeTransactionCIP66(
  transaction: TransactionSerializableCIP66,
  signature?: Signature | undefined,
): SerializeTransactionCIP66ReturnType {
  assertTransactionCIP66(transaction)

  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    feeCurrency,
    maxFeeInFeeCurrency,
    data,
  } = transaction

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : EMPTY_HEX_VALUE,
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : EMPTY_HEX_VALUE,
    maxFeePerGas ? toHex(maxFeePerGas) : EMPTY_HEX_VALUE,
    gas ? toHex(gas) : EMPTY_HEX_VALUE,
    to ?? EMPTY_HEX_VALUE,
    value ? toHex(value) : EMPTY_HEX_VALUE,
    data ?? EMPTY_HEX_VALUE,
    serializeAccessList(accessList),
    feeCurrency!,
    toHex(maxFeeInFeeCurrency!),
    ...toYParitySignatureArray(transaction, signature),
  ]

  return concatHex([
    '0x7a',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionCIP66ReturnType
}

// maxFeePerGas must be less than 2^256 - 1
const MAX_MAX_FEE_PER_GAS = 2n ** 256n - 1n

export function assertTransactionCIP42(
  transaction: TransactionSerializableCIP42,
) {
  const {
    chainId,
    maxPriorityFeePerGas,
    gasPrice,
    maxFeePerGas,
    to,
    feeCurrency,
    gatewayFee,
    gatewayFeeRecipient,
  } = transaction
  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (gasPrice)
    throw new BaseError(
      '`gasPrice` is not a valid CIP-42 Transaction attribute.',
    )

  if (isPresent(maxFeePerGas) && maxFeePerGas > MAX_MAX_FEE_PER_GAS)
    throw new FeeCapTooHighError({ maxFeePerGas })

  if (
    isPresent(maxPriorityFeePerGas) &&
    isPresent(maxFeePerGas) &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })

  if (
    (isPresent(gatewayFee) && isEmpty(gatewayFeeRecipient)) ||
    (isPresent(gatewayFeeRecipient) && isEmpty(gatewayFee))
  ) {
    throw new BaseError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
  }

  if (isPresent(feeCurrency) && !isAddress(feeCurrency)) {
    throw new BaseError(
      '`feeCurrency` MUST be a token address for CIP-42 transactions.',
    )
  }

  if (isPresent(gatewayFeeRecipient) && !isAddress(gatewayFeeRecipient)) {
    throw new InvalidAddressError(gatewayFeeRecipient)
  }

  if (isEmpty(feeCurrency) && isEmpty(gatewayFeeRecipient)) {
    throw new BaseError(
      'Either `feeCurrency` or `gatewayFeeRecipient` must be provided for CIP-42 transactions.',
    )
  }
}

type Cip64OrCip66 = 'CIP-64' | 'CIP-66'

export function assertTransactionCIP64(
  transaction: TransactionSerializableCIP64,
  type: Cip64OrCip66 = 'CIP-64',
) {
  const {
    chainId,
    maxPriorityFeePerGas,
    gasPrice,
    maxFeePerGas,
    to,
    feeCurrency,
  } = transaction

  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })

  if (gasPrice)
    throw new BaseError(
      `\`gasPrice\` is not a valid ${type} Transaction attribute.`,
    )

  if (isPresent(maxFeePerGas) && maxFeePerGas > MAX_MAX_FEE_PER_GAS)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    isPresent(maxPriorityFeePerGas) &&
    isPresent(maxFeePerGas) &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })

  if (isPresent(feeCurrency) && !isAddress(feeCurrency)) {
    throw new BaseError(
      `\`feeCurrency\` MUST be a token address for ${type} transactions.`,
    )
  }

  if (isEmpty(feeCurrency)) {
    throw new BaseError(
      `\`feeCurrency\` must be provided for ${type} transactions.`,
    )
  }
}

export function assertTransactionCIP66(
  transaction: TransactionSerializableCIP66,
) {
  assertTransactionCIP64(transaction as TransactionSerializableCIP64, 'CIP-66')

  const { maxFeeInFeeCurrency } = transaction

  if (isEmpty(maxFeeInFeeCurrency)) {
    throw new BaseError(
      '`maxFeeInFeeCurrency` must be provided for CIP-66 transactions.',
    )
  }
}
