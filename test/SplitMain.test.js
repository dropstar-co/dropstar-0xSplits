const { fail } = require('assert')
const { expect } = require('chai')
const { parseUnits, parseEther } = require('ethers/lib/utils')
const { ethers, network } = require('hardhat')
const { provider } = ethers

const { formatEther, getContractAddress } = ethers.utils

const { BN, soliditySha3 } = require('web3-utils')

describe('0xSplits', function () {
  let deployer, recipient1, recipient2, recipient3

  let SplitMain, splitMain

  beforeEach(async function () {
    SplitMain = await ethers.getContractFactory('SplitMain')
    splitMain = await SplitMain.deploy()

    this.mock = splitMain
    ;[deployer, recipient1, recipient2, recipient3] = await ethers.getSigners()
  })

  it('Should exist when deployed', async function () {
    await splitMain.deployed()
  })

  it('Use the splits from the beggining', async function () {
    await splitMain.deployed()
    const PERCENTAGE_SCALE = (await splitMain.PERCENTAGE_SCALE()).toString()

    let splitData = [
      {
        address: recipient1.address,
        allocation: PERCENTAGE_SCALE * 0.1,
      },
      {
        address: recipient2.address,
        allocation: PERCENTAGE_SCALE * 0.3,
      },
      {
        address: recipient3.address,
        allocation: PERCENTAGE_SCALE * 0.6,
      },
    ]

    splitData = splitData.sort((a, b) =>
      a.address.toLowerCase().localeCompare(b.address.toLowerCase()),
    )

    const distributorFee = 0
    const splitDataAddresses = splitData.map((a) => a.address)
    const splitDataPercents = splitData.map((a) => a.allocation)

    const splitAddressTx = await splitMain.createSplit(
      splitDataAddresses,
      splitDataPercents,
      distributorFee,
      ethers.constants.AddressZero,
    )

    const splitAddressTxReceipt = await splitAddressTx.wait()

    //console.log(JSON.stringify({ splitAddressTxReceipt }, null, 2))

    const splitAddress = splitAddressTxReceipt.events[0].args[0]

    const splitWallet = await ethers.getContractAt('SplitWallet', splitAddress)
    await splitWallet.deployed()

    const deployerBalance_0 = await provider.getBalance(deployer.address)
    const splitBalance____0 = await provider.getBalance(splitAddress)

    console.log({
      deployerBalance_0,
      splitBalance____0,
    })

    await deployer.sendTransaction({
      to: splitAddress,
      value: parseEther('500'),
    })

    const deployerBalance_1 = await provider.getBalance(deployer.address)
    const splitBalance____1 = await provider.getBalance(splitAddress)

    console.log({
      deployerBalance_0,
      splitBalance____0,
      deployerBalance_1,
      splitBalance____1,
    })

    await splitMain.distributeETH(
      splitAddress,
      splitDataAddresses,
      splitDataPercents,
      distributorFee,
      deployer.address,
    )

    const deployerBalance_2 = await provider.getBalance(deployer.address)
    const splitBalance____2 = await provider.getBalance(splitAddress)

    console.log({
      deployerBalance_0,
      deployerBalance_1,
      deployerBalance_2,

      splitBalance____0,
      splitBalance____1,
      splitBalance____2,
    })

    const recipient1_0 = await provider.getBalance(recipient1.address)
    const recipient2_0 = await provider.getBalance(recipient2.address)
    const recipient3_0 = await provider.getBalance(recipient3.address)

    await splitMain.withdraw(recipient1.address, 1, [])
    await splitMain.withdraw(recipient2.address, 2, [])
    await splitMain.withdraw(recipient3.address, 3, [])

    const recipient1_1 = await provider.getBalance(recipient1.address)
    const recipient2_1 = await provider.getBalance(recipient2.address)
    const recipient3_1 = await provider.getBalance(recipient3.address)

    console.log({
      recipient1_0,
      recipient2_0,
      recipient3_0,
      recipient1_1,
      recipient2_1,
      recipient3_1,
    })
  })
})
