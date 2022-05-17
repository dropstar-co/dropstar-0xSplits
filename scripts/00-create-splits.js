// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const fs = require('fs')

const { GUTTO_SERTA_VENLY_ADDRESS, ERALP_ORKUN_CIHAN_VENLY_ADDRESS, DROPSTAR_ADDRESS } = require('../.env.js')

const { getSplitParameters, deploySplitIfNotDeployed, checkBalanceAndPullItToWallets } = require('./utils/splits')

async function main() {
  const [deployer] = await ethers.getSigners()

  const distributorFee = 0
  const artistWallets = [GUTTO_SERTA_VENLY_ADDRESS, ERALP_ORKUN_CIHAN_VENLY_ADDRESS, DROPSTAR_ADDRESS]
  const artistWeightsRoyalties = [0.015, 0.01, 0.005]
  const artistWeightsNFT1to4 = [45.0, 45.0, 10.0]
  const artistWeightsNFT5 = [40, 50, 10]
  const artistWeightsNFT6 = [70, 20, 10]

  const splitConfigRoyalties = await getSplitParameters(artistWallets, artistWeightsRoyalties, distributorFee)
  const splitConfigPSONFT1to4 = await getSplitParameters(artistWallets, artistWeightsNFT1to4, distributorFee)
  const splitConfigPSONFT5 = await getSplitParameters(artistWallets, artistWeightsNFT5, distributorFee)
  const splitConfigPSONFT6 = await getSplitParameters(artistWallets, artistWeightsNFT6, distributorFee)

  console.log(`splitWalletAddress for royalties:            ${splitConfigRoyalties.splitWalletAddress}`)
  console.log(`splitWalletAddress for primary sale NFT 1-4: ${splitConfigPSONFT1to4.splitWalletAddress}`)
  console.log(`splitWalletAddress for primary sale NFT 5:   ${splitConfigPSONFT5.splitWalletAddress}`)
  console.log(`splitWalletAddress for primary sale NFT 6:   ${splitConfigPSONFT6.splitWalletAddress}`)

  await deploySplitIfNotDeployed(splitConfigRoyalties, 0)
  await deploySplitIfNotDeployed(splitConfigPSONFT1to4, 0)
  await deploySplitIfNotDeployed(splitConfigPSONFT5, 0)
  await deploySplitIfNotDeployed(splitConfigPSONFT6, 0)

  await checkBalanceAndPullItToWallets(splitConfigPSONFT1to4)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
