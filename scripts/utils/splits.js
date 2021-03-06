// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require('hardhat')
const { SPLIT_MAIN_ADDRESS } = require('../../.env.js')

const distributorFee = 0

async function getSplitParameters(artists, weights, distributorFee) {
  if (artists.length !== weights.length) throw 'artists[] and weights[] length do not match'

  const splitMain = await ethers.getContractAt('SplitMain', SPLIT_MAIN_ADDRESS)
  await splitMain.deployed()

  const PERCENTAGE_SCALE = (await splitMain.PERCENTAGE_SCALE()).toString()

  let fullAllocation = 0

  let i
  for (i = 0; i < artists.length; i++) {
    fullAllocation += weights[i]
  }

  let splitData = []

  for (i = 0; i < artists.length; i++) {
    splitData.push({
      address: artists[i],
      allocation: Math.round((weights[i] / fullAllocation) * PERCENTAGE_SCALE),
    })
  }

  splitData = splitData.sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))

  const splitDataAddresses = splitData.map((a) => a.address)
  const splitDataPercents = splitData.map((a) => a.allocation)

  const splitWalletAddress = await splitMain.predictImmutableSplitAddress(
    splitDataAddresses,
    splitDataPercents,
    distributorFee,
  )

  return {
    splitWalletAddress,
    splitDataAddresses,
    splitDataPercents,
  }
}

async function deploySplitIfNotDeployed(splitConfig, distributorFee) {
  const { splitWalletAddress, splitDataAddresses, splitDataPercents } = splitConfig
  const splitWallet = await ethers.getContractAt('SplitWallet', splitWalletAddress)
  try {
    await splitWallet.deployed()
    console.log(`Split ${splitWalletAddress} already created, skipping createSplit`)
    return
  } catch (err) {
    console.log(`Split ${splitWalletAddress} not exists, proceeding to createSplit`)
  }

  const splitMain = await ethers.getContractAt('SplitMain', SPLIT_MAIN_ADDRESS)
  await splitMain.deployed()

  await splitMain.createSplit(splitDataAddresses, splitDataPercents, distributorFee, ethers.constants.AddressZero)
  console.log('   created')
}

async function checkBalanceAndPullItToWallets(splitConfig) {
  const { splitWalletAddress, splitDataAddresses, splitDataPercents } = splitConfig

  console.log(`splitWalletAddress = ${splitWalletAddress}`)

  const { provider } = ethers
  const balance = (await provider.getBalance(splitWalletAddress)).toString()

  const splitMain = await ethers.getContractAt('SplitMain', SPLIT_MAIN_ADDRESS)
  await splitMain.deployed()

  if (balance !== '0' || balance !== '1') {
    console.log(`     there is balance ${balance}`)

    /*
    await splitMain.distributeETH(
      splitWalletAddress,
      splitDataAddresses,
      splitDataPercents,
      distributorFee,
      ethers.constants.AddressZero,
    )
    console.log('       distributed')
    */
  }

  let i
  for (i = 0; i < splitDataAddresses.length; i++) {
    const account = splitDataAddresses[i]
    const accountBalance = (await splitMain.getETHBalance(account)).toString()
    console.log(`account ${account} balance ${accountBalance}`)

    /*
    if (accountBalance !== '0' || accountBalance !== '1') {
      console.log('  there is balance')

      await splitMain.withdraw(account, accountBalance, [])
      console.log('       withdrawn')
    }
    */
  }
}

module.exports = { getSplitParameters, deploySplitIfNotDeployed, checkBalanceAndPullItToWallets }
