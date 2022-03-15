// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const fs = require('fs')

const fetch = require('node-fetch')

const {
  GUTTO_SERTA_ADDRESS,
  ERALP_ORKUN_CIHAN_ADDRESS,
  DROPSTAR_ADDRESS,
} = require('../.env.js')

async function main() {
  const [deployer] = await ethers.getSigners()

  const splitMainAddress = '0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE'

  const splitMain = await ethers.getContractAt('SplitMain', splitMainAddress)
  await splitMain.deployed()

  const PERCENTAGE_SCALE = (await splitMain.PERCENTAGE_SCALE()).toString()

  const guttoSertaAddress = GUTTO_SERTA_ADDRESS
  const dropStarAddress = DROPSTAR_ADDRESS
  const eralpOrkunCihanAddress = ERALP_ORKUN_CIHAN_ADDRESS

  const guttoSertaAllocation = 0.015
  const dropStarAllocation = 0.005
  const eralpOrkunCihanAllocation = 0.01

  const fullAllocation =
    guttoSertaAllocation + dropStarAllocation + eralpOrkunCihanAllocation

  let splitData = [
    {
      name: 'Gutto',
      address: guttoSertaAddress,
      allocation: Math.round(
        (guttoSertaAllocation / fullAllocation) * PERCENTAGE_SCALE,
      ),
    },
    {
      name: 'DropStar',
      address: dropStarAddress,
      allocation: Math.round(
        (dropStarAllocation / fullAllocation) * PERCENTAGE_SCALE,
      ),
    },
    {
      name: 'Eralp',
      address: eralpOrkunCihanAddress,
      allocation: Math.round(
        (eralpOrkunCihanAllocation / fullAllocation) * PERCENTAGE_SCALE,
      ),
    },
  ]

  splitData = splitData.sort((a, b) =>
    a.address.toLowerCase().localeCompare(b.address.toLowerCase()),
  )

  console.log({ splitData })

  const distributorFee = 0
  const splitDataAddresses = splitData.map((a) => a.address)
  const splitDataPercents = splitData.map((a) => a.allocation)

  console.log({ splitDataAddresses, splitDataPercents })

  const splitWalletAddress = await splitMain.predictImmutableSplitAddress(
    splitDataAddresses,
    splitDataPercents,
    distributorFee,
  )
  console.log(`splitWalletAddress: ${splitWalletAddress}`)

  const splitWallet = await ethers.getContractAt(
    'SplitWallet',
    splitWalletAddress,
  )
  try {
    await splitWallet.deployed()

    console.log('Split already created, skipping createSplit')
    return
  } catch (err) {
    console.log('Split not exists, proceeding to createSplit')
  }

  await splitMain.createSplit(
    splitDataAddresses,
    splitDataPercents,
    distributorFee,
    ethers.constants.AddressZero,
  )
  console.log('   created')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
