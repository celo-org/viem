import { InvalidSerializedTransactionError } from '../errors/transaction.js'
import type { Hex } from '../types/misc.js'
import type { ExactPartial } from '../types/utils.js'
import { isHex } from '../utils/data/isHex.js'
import { sliceHex } from '../utils/data/slice.js'
import { hexToBigInt, hexToNumber } from '../utils/encoding/fromHex.js'
import type { RecursiveArray } from '../utils/encoding/toRlp.js'
import type { GetSerializedTransactionType } from '../utils/transaction/getSerializedTransactionType.js'
import {
  type ParseTransactionReturnType as ParseTransactionReturnType_,
  parseAccessList,
  parseTransaction as parseTransaction_,
  toTransactionArray,
} from '../utils/transaction/parseTransaction.js'
import {
  assertTransactionCIP42,
  assertTransactionCIP64,
  assertTransactionCIP66,
} from './serializers.js'
import type {
  CeloTransactionSerialized,
  CeloTransactionType,
  TransactionSerializableCIP42,
  TransactionSerializableCIP64,
  TransactionSerializableCIP66,
  TransactionSerializedCIP42,
  TransactionSerializedCIP64,
  TransactionSerializedCIP66,
} from './types.js'
import { EMPTY_HEX_VALUE } from './utils.js'

export type ParseTransactionReturnType<
  TSerialized extends CeloTransactionSerialized = CeloTransactionSerialized,
  TType extends CeloTransactionType = GetSerializedTransactionType<TSerialized>,
> = TSerialized extends TransactionSerializedCIP42
  ? TransactionSerializableCIP42
  : ParseTransactionReturnType_<TSerialized, TType>

export function parseTransaction<TSerialized extends CeloTransactionSerialized>(
  serializedTransaction: TSerialized,
): ParseTransactionReturnType<TSerialized> {
  const serializedType = sliceHex(serializedTransaction, 0, 1)

  if (serializedType === '0x7c')
    return parseTransactionCIP42(
      serializedTransaction as TransactionSerializedCIP42,
    ) as ParseTransactionReturnType<TSerialized>

  if (serializedType === '0x7b')
    return parseTransactionCIP64(
      serializedTransaction as TransactionSerializedCIP64,
    ) as ParseTransactionReturnType<TSerialized>

  if (serializedType === '0x7a')
    return parseTransactionCIP66(
      serializedTransaction as TransactionSerializedCIP66,
    ) as ParseTransactionReturnType<TSerialized>

  return parseTransaction_(
    serializedTransaction,
  ) as ParseTransactionReturnType<TSerialized>
}

function parseTransactionCIP42(
  serializedTransaction: TransactionSerializedCIP42,
): TransactionSerializableCIP42 {
  const transactionArray = toTransactionArray(serializedTransaction)

  const [
    chainId,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    feeCurrency,
    gatewayFeeRecipient,
    gatewayFee,
    to,
    value,
    data,
    accessList,
    v,
    r,
    s,
  ] = transactionArray

  if (transactionArray.length !== 15 && transactionArray.length !== 12) {
    throw new InvalidSerializedTransactionError({
      attributes: {
        chainId,
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gas,
        feeCurrency,
        to,
        gatewayFeeRecipient,
        gatewayFee,
        value,
        data,
        accessList,
        ...(transactionArray.length > 12
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'cip42',
    })
  }

  const transaction: ExactPartial<TransactionSerializableCIP42> = {
    chainId: hexToNumber(chainId as Hex),
    type: 'cip42',
  }

  if (isHex(to) && to !== EMPTY_HEX_VALUE) transaction.to = to
  if (isHex(gas) && gas !== EMPTY_HEX_VALUE) transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== EMPTY_HEX_VALUE) transaction.data = data
  if (isHex(nonce) && nonce !== EMPTY_HEX_VALUE)
    transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== EMPTY_HEX_VALUE)
    transaction.value = hexToBigInt(value)
  if (isHex(feeCurrency) && feeCurrency !== EMPTY_HEX_VALUE)
    transaction.feeCurrency = feeCurrency
  if (isHex(gatewayFeeRecipient) && gatewayFeeRecipient !== EMPTY_HEX_VALUE)
    transaction.gatewayFeeRecipient = gatewayFeeRecipient
  if (isHex(gatewayFee) && gatewayFee !== EMPTY_HEX_VALUE)
    transaction.gatewayFee = hexToBigInt(gatewayFee)
  if (isHex(maxFeePerGas) && maxFeePerGas !== EMPTY_HEX_VALUE)
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== EMPTY_HEX_VALUE)
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== EMPTY_HEX_VALUE)
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)

  assertTransactionCIP42(transaction as TransactionSerializableCIP42)

  return transaction as TransactionSerializableCIP42
}

function parseTransactionCIP64(
  serializedTransaction: TransactionSerializedCIP64,
): TransactionSerializableCIP64 {
  const transactionArray = toTransactionArray(serializedTransaction)

  const [
    chainId,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    to,
    value,
    data,
    accessList,
    feeCurrency,
    v,
    r,
    s,
  ] = transactionArray

  if (transactionArray.length !== 13 && transactionArray.length !== 10) {
    throw new InvalidSerializedTransactionError({
      attributes: {
        chainId,
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gas,
        to,
        value,
        data,
        accessList,
        feeCurrency,
        ...(transactionArray.length > 10
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'cip64',
    })
  }

  const transaction: ExactPartial<TransactionSerializableCIP64> = {
    chainId: hexToNumber(chainId as Hex),
    type: 'cip64',
  }

  if (isHex(to) && to !== EMPTY_HEX_VALUE) transaction.to = to
  if (isHex(gas) && gas !== EMPTY_HEX_VALUE) transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== EMPTY_HEX_VALUE) transaction.data = data
  if (isHex(nonce) && nonce !== EMPTY_HEX_VALUE)
    transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== EMPTY_HEX_VALUE)
    transaction.value = hexToBigInt(value)
  if (isHex(feeCurrency) && feeCurrency !== EMPTY_HEX_VALUE)
    transaction.feeCurrency = feeCurrency
  if (isHex(maxFeePerGas) && maxFeePerGas !== EMPTY_HEX_VALUE)
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== EMPTY_HEX_VALUE)
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== EMPTY_HEX_VALUE)
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)

  assertTransactionCIP64(transaction as TransactionSerializableCIP64)

  return transaction as TransactionSerializableCIP64
}

function parseTransactionCIP66(
  serializedTransaction: TransactionSerializedCIP66,
): TransactionSerializableCIP66 {
  const transactionArray = toTransactionArray(serializedTransaction)

  const [
    chainId,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    to,
    value,
    data,
    accessList,
    feeCurrency,
    maxFeeInFeeCurrency,
    v,
    r,
    s,
  ] = transactionArray

  if (transactionArray.length !== 14 && transactionArray.length !== 11) {
    throw new InvalidSerializedTransactionError({
      attributes: {
        chainId,
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gas,
        to,
        value,
        data,
        accessList,
        feeCurrency,
        maxFeeInFeeCurrency,
        ...(transactionArray.length > 11
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'cip66',
    })
  }

  const transaction: ExactPartial<TransactionSerializableCIP66> = {
    chainId: hexToNumber(chainId as Hex),
    type: 'cip66',
  }

  if (isHex(to) && to !== EMPTY_HEX_VALUE) transaction.to = to
  if (isHex(gas) && gas !== EMPTY_HEX_VALUE) transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== EMPTY_HEX_VALUE) transaction.data = data
  if (isHex(nonce) && nonce !== EMPTY_HEX_VALUE)
    transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== EMPTY_HEX_VALUE)
    transaction.value = hexToBigInt(value)
  if (isHex(maxFeePerGas) && maxFeePerGas !== EMPTY_HEX_VALUE)
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== EMPTY_HEX_VALUE)
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== EMPTY_HEX_VALUE)
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)

  if (isHex(feeCurrency) && feeCurrency !== EMPTY_HEX_VALUE)
    transaction.feeCurrency = feeCurrency
  if (isHex(maxFeeInFeeCurrency) && maxFeeInFeeCurrency !== EMPTY_HEX_VALUE)
    transaction.maxFeeInFeeCurrency = hexToBigInt(maxFeeInFeeCurrency)

  assertTransactionCIP66(transaction as TransactionSerializableCIP66)

  return transaction as TransactionSerializableCIP66
}
