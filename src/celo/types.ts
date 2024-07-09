import type { Address } from 'abitype'

import type { Block, BlockTag } from '../types/block.js'
import type { FeeValuesEIP1559 } from '../types/fee.js'
import type { Hex } from '../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  TransactionType,
  RpcTransaction as core_RpcTransaction,
  RpcTransactionRequest as core_RpcTransactionRequest,
} from '../types/rpc.js'
import type {
  AccessList,
  TransactionBase,
  TransactionRequestBase,
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerialized,
  Transaction as core_Transaction,
  TransactionRequest as core_TransactionRequest,
} from '../types/transaction.js'
import type { Assign, ExactPartial, OneOf } from '../types/utils.js'

import type {
  OpStackDepositTransaction,
  OpStackRpcTransaction,
  TransactionSerializableDeposit,
  TransactionSerializedDeposit,
} from '../op-stack/types/transaction.js'

export type CeloBlock<
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
> = Assign<
  Block<
    bigint,
    includeTransactions,
    blockTag,
    CeloTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    difficulty?: bigint | undefined
    gasLimit?: bigint | undefined
    mixHash?: undefined
    nonce?: bigint | null
    randomness?:
      | {
          committed: Hex
          revealed: Hex
        }
      | undefined
    uncles?: undefined
  }
>

export type CeloRpcBlock<
  blockTag extends BlockTag = BlockTag,
  includeTransactions extends boolean = boolean,
> = Assign<
  RpcBlock<
    blockTag,
    includeTransactions,
    RpcTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    difficulty?: Hex | undefined
    mixHash?: undefined
    nonce?: Hex | null
    gasLimit?: Hex | undefined
    randomness?:
      | {
          committed: Hex
          revealed: Hex
        }
      | undefined
    uncles?: undefined
  }
>

export type CeloRpcTransaction<isPending extends boolean = boolean> = OneOf<
  | RpcTransaction<isPending>
  | RpcTransactionCIP42<isPending>
  | RpcTransactionCIP64<isPending>
  | RpcTransactionCIP66<isPending>
  | OpStackRpcTransaction<isPending>
>

export type CeloRpcTransactionRequest = OneOf<
  | RpcTransactionRequest
  | RpcTransactionRequestCIP64
  | RpcTransactionRequestCIP66
>

export type CeloTransaction<isPending extends boolean = boolean> = OneOf<
  | Transaction<isPending>
  | TransactionCIP42<isPending>
  | TransactionCIP64<isPending>
  | TransactionCIP66<isPending>
  | OpStackDepositTransaction<isPending>
>

export type CeloTransactionRequest = OneOf<
  TransactionRequest | TransactionRequestCIP64 | TransactionRequestCIP66
>

export type CeloTransactionSerializable = OneOf<
  | TransactionSerializable
  | TransactionSerializableCIP64
  | TransactionSerializableCIP66
  | TransactionSerializableDeposit
>

export type CeloTransactionSerialized<
  TType extends CeloTransactionType = CeloTransactionType,
> =
  | TransactionSerialized<TType>
  | TransactionSerializedCIP42
  | TransactionSerializedCIP64
  | TransactionSerializedCIP66
  | TransactionSerializedDeposit

export type CeloTransactionType = TransactionType | 'cip42' | 'cip64' | 'cip66'

type RpcTransaction<isPending extends boolean = boolean> =
  core_RpcTransaction<isPending> & {
    feeCurrency: Address | null
    maxFeeInFeeCurrency?: bigint | undefined
    gatewayFee: Hex | null
    gatewayFeeRecipient: Address | null
  }

type RpcTransactionRequest = core_RpcTransactionRequest & {
  feeCurrency?: Address | undefined
  maxFeeInFeeCurrency?: bigint | null
}

export type RpcTransactionCIP42<isPending extends boolean = boolean> = Omit<
  TransactionBase<Quantity, Index, isPending>,
  'typeHex'
> & {
  accessList: AccessList
  chainId: Index
  feeCurrency: Address | null
  maxFeeInFeeCurrency?: undefined
  gatewayFee: Hex | null
  gatewayFeeRecipient: Address | null
  type: '0x7c'
} & FeeValuesEIP1559<Quantity>

export type RpcTransactionCIP64<isPending extends boolean = boolean> = Omit<
  TransactionBase<Quantity, Index, isPending>,
  'typeHex'
> & {
  accessList: AccessList
  chainId: Index
  feeCurrency: Address | null
  maxFeeInFeeCurrency?: undefined
  gatewayFee?: undefined
  gatewayFeeRecipient?: undefined
  type: '0x7b'
} & FeeValuesEIP1559<Quantity>

export type RpcTransactionCIP66<TPending extends boolean = boolean> = Omit<
  TransactionBase<Quantity, Index, TPending>,
  'typeHex'
> &
  FeeValuesEIP1559<Quantity> & {
    feeCurrency: Address
    maxFeeInFeeCurrency: Quantity
    gatewayFee?: undefined
    gatewayFeeRecipient?: undefined
    type: '0x7a'
  }

export type RpcTransactionRequestCIP64 = TransactionRequestBase<
  Quantity,
  Index
> & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  maxFeeInFeeCurrency?: undefined
  type?: '0x7b' | undefined
} & ExactPartial<FeeValuesEIP1559<Quantity>>

export type RpcTransactionRequestCIP66 = TransactionRequestBase<
  Quantity,
  Index
> & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  maxFeeInFeeCurrency?: Quantity | undefined
  type?: '0x7a' | undefined
} & ExactPartial<FeeValuesEIP1559<Quantity>>

type Transaction<isPending extends boolean = boolean> = core_Transaction<
  bigint,
  number,
  isPending
> & {
  feeCurrency: Address | null
  maxFeeInFeeCurrency: bigint | undefined
  gatewayFee: bigint | null
  gatewayFeeRecipient: Address | null
}

export type TransactionCIP42<isPending extends boolean = boolean> =
  TransactionBase<bigint, number, isPending> &
    FeeValuesEIP1559 & {
      accessList: AccessList
      chainId: number
      feeCurrency: Address | null
      gatewayFee: bigint | null
      gatewayFeeRecipient: Address | null
      type: 'cip42'
    }

export type TransactionCIP64<isPending extends boolean = boolean> =
  TransactionBase<bigint, number, isPending> &
    FeeValuesEIP1559 & {
      accessList: AccessList
      chainId: number
      feeCurrency: Address | null
      type: 'cip64'
    }

export type TransactionCIP66<isPending extends boolean = boolean> =
  TransactionBase<bigint, number, isPending> &
    FeeValuesEIP1559 & {
      feeCurrency: Address
      maxFeeInFeeCurrency: bigint
      gatewayFee?: undefined
      gatewayFeeRecipient?: undefined
      type: 'cip66'
    }

type TransactionRequest = core_TransactionRequest & {
  feeCurrency?: Address | undefined
  maxFeeInFeeCurrency?: bigint | undefined
}

export type TransactionRequestCIP64 = TransactionRequestBase & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  maxFeeInFeeCurrency?: undefined
  type?: 'cip64' | undefined
} & ExactPartial<FeeValuesEIP1559>

export type TransactionRequestCIP66<TQuantity = bigint> =
  TransactionRequestBase &
    ExactPartial<FeeValuesEIP1559> & {
      accessList?: AccessList | undefined
      feeCurrency?: Address | undefined
      maxFeeInFeeCurrency?: TQuantity | undefined
      gatewayFee?: undefined
      gatewayFeeRecipient?: undefined
      type?: 'cip66' | undefined
    }

export type TransactionSerializableCIP42<
  quantity = bigint,
  index = number,
> = TransactionSerializableBase<quantity, index> & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  gatewayFeeRecipient?: Address | undefined
  gatewayFee?: quantity | undefined
  maxFeeInFeeCurrency?: undefined
  chainId: number
  type?: 'cip42' | undefined
} & ExactPartial<FeeValuesEIP1559<quantity>>

export type TransactionSerializableCIP64<
  quantity = bigint,
  index = number,
> = TransactionSerializableBase<quantity, index> & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  maxFeeInFeeCurrency?: undefined
  chainId: number
  type?: 'cip64' | undefined
} & ExactPartial<FeeValuesEIP1559<quantity>>

export type TransactionSerializableCIP66<
  quantity = bigint,
  index = number,
> = TransactionSerializableBase<quantity, index> &
  ExactPartial<FeeValuesEIP1559<quantity>> & {
    accessList?: AccessList | undefined
    feeCurrency?: Address | undefined
    maxFeeInFeeCurrency?: quantity | undefined
    gatewayFee?: undefined
    gatewayFeeRecipient?: undefined
    chainId: number
    type?: 'cip66' | undefined
  }

export type TransactionSerializedCIP42 = `0x7c${string}`
export type TransactionSerializedCIP64 = `0x7b${string}`
export type TransactionSerializedCIP66 = `0x7a${string}`
