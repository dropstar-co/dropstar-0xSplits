// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const fs = require('fs')

const { GUTTO_SERTA_VENLY_ADDRESS, ERALP_ORKUN_CIHAN_VENLY_ADDRESS, DROPSTAR_ADDRESS } = require('../.env.js')
const { getSplitParameters, deploySplitIfNotDeployed } = require('./utils/splits')

async function main() {
  const [deployer] = await ethers.getSigners()

  const distributorFee = 0
  const artistWallets = [GUTTO_SERTA_VENLY_ADDRESS, ERALP_ORKUN_CIHAN_VENLY_ADDRESS, DROPSTAR_ADDRESS]
  const artistWeights = [45.0, 45.0, 10.0]

  const splitConfig = await getSplitParameters(artistWallets, artistWeights, distributorFee)
  console.log({ splitConfig })

  console.log(`splitWalletAddress: ${splitConfig.splitWalletAddress}`)

  deploySplitIfNotDeployed(splitConfig, 0)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
