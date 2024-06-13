import type { OpStackBlock } from '~viem/chains/index.ts'

/*
 * A comparison how block structures on Celo. There are essentially 5,
 *    - Blocks produced by Celo as a Layer 1
 *         & Pre GingerBread
 *         & Post GingerBread
 *    - Blocks produced by Celo as a Layer 1 when fetched thru Cel2 node
 *         & Pre GingerBread
 *         & Post GingerBread
 *    - Blocks Produced by Celo as a Layer 2
 *
 */

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface PreGingerBreadCel1Block {
  baseFeePerGas: quantity | null
  difficulty: quantity
  extraData: Hex
  gasLimit: quantity
  gasUsed: quantity
  hash: TBlockTag extends 'pending' ? null : Hash
  logsBloom: TBlockTag extends 'pending' ? null : Hex
  miner: Address
  // mixHash is not on these blocks
  // Nonce was not on these blocks
  number: TBlockTag extends 'pending' ? null : quantity
  parentHash: Hash
  receiptsRoot: Hex
  size: quantity
  stateRoot: Hash
  timestamp: quantity
  totalDifficulty: quantity | null
  transactions: TIncludeTransactions extends true ? TTransaction[] : Hash[]
  transactionsRoot: Hash
  // No uncles or sha3Uncles
  //
  randomness: {
    committed: Hex
    revealed: Hex
  }
}

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface PostGingerBreadCel1Block {
  baseFeePerGas: quantity | null
  difficulty: quantity
  extraData: Hex
  gasLimit: quantity
  gasUsed: quantity
  hash: TBlockTag extends 'pending' ? null : Hash
  logsBloom: TBlockTag extends 'pending' ? null : Hex
  miner: Address
  //   Note that mixHash is not here
  nonce: TBlockTag extends 'pending' ? null : Hex
  number: TBlockTag extends 'pending' ? null : quantity
  parentHash: Hash
  receiptsRoot: Hex
  sha3Uncles: Hash
  size: quantity
  stateRoot: Hash
  timestamp: quantity
  totalDifficulty: quantity | null
  transactions: TIncludeTransactions extends true ? TTransaction[] : Hash[]
  transactionsRoot: Hash
  uncles: []
  //
  randomness: {
    committed: Hex
    revealed: Hex
  }
}

interface PreGingerbreadBlockOCel2 {
  difficulty: quantity
  extraData: Hex
  gasLimit: quantity
  gasUsed: quantity
  hash: TBlockTag extends 'pending' ? null : Hash
  logsBloom: TBlockTag extends 'pending' ? null : Hex
  miner: Address
  mixHash: Hash
  nonce: TBlockTag extends 'pending' ? null : Hex
  number: TBlockTag extends 'pending' ? null : quantity
  parentHash: Hash
  receiptsRoot: Hex
  sha3Uncles: Hash
  size: quantity
  stateRoot: Hash
  timestamp: quantity
  totalDifficulty: quantity | null
  transactions: TIncludeTransactions extends true ? TTransaction[] : Hash[]
  transactionsRoot: Hash
  uncles: []
}

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface PostGinerbreadPreCel2BlockOnCel2 extends PreGingerbreadBlockOCel2 {
  baseFeePerGas: quantity | null
}
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface Cel2Block extends OpStackBlock {}

// biome-ignore lint/style/useEnumInitializers: <explanation>
// biome-ignore lint/correctness/noUnusedVariables: Summary of attributes that do not appear on all celo blocks
enum SometimesNullAttributes {
  baseFeePerGas, // will be missing for older blocks after move to cel2
  randomness, // removed from all blocks post cel2
  sha3Uncles, // included in all blocks post ginger bread
  uncles, // included in all blocks post ginger bread
  nonce, // included in all blocks post ginger brea
  mixHash, // included in all blocks fetched thru cel2, missing on cel1
}

/*
 * For viem purposes the important changes are the eventual removal of randomness, and the presence of once missing block attributes
 * We would like for viem to be usable both for celo as an L1 and for Celo as L2 at the same time
 * as there will be Cel2 testnets available while celo itself remains in L1 mode for a while
 * So i envision Intermediate Step where celo block has all possible field with some marked optional.
 * And then a Post Cel2 mainnet launch phase
 */

// the union of all possible block attributes block on celo as l1 and as l2 can have
// biome-ignore lint/correctness/noUnusedVariables:
interface ViemCeloTransitoryBlockInterface {
  baseFeePerGas?: quantity | null
  difficulty: quantity
  extraData: Hex
  gasLimit: quantity
  gasUsed: quantity
  hash: TBlockTag extends 'pending' ? null : Hash
  logsBloom: TBlockTag extends 'pending' ? null : Hex
  miner: Address
  mixHash?: Hash
  randomness?: {
    committed: Hex
    revealed: Hex
  }
  nonce?: TBlockTag extends 'pending' ? null : Hex
  number: TBlockTag extends 'pending' ? null : quantity
  parentHash: Hash
  receiptsRoot: Hex
  sha3Uncles?: Hash
  size: quantity
  stateRoot: Hash
  timestamp: quantity
  totalDifficulty: quantity | null
  transactions: TIncludeTransactions extends true ? TTransaction[] : Hash[]
  transactionsRoot: Hash
  uncles?: []
}

// biome-ignore lint/correctness/noUnusedVariables: Summary of attributes that do not appear on all celo blocks
interface ViemCeloBlockInterFacePostCel2Launch extends OpStackBlock {}
