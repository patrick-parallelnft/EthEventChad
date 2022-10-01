// Setup: npm install alchemy-sdk
const { Network, Alchemy } = require("alchemy-sdk");
const { ethers } = require("ethers");
const parallel_alpha_abi = require("./abi/parallel_alpha.json");

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const provider = new ethers.providers.AlchemyProvider(
  "homestead",
  process.env.ALCHEMY_KEY
);

const parallel_alpha_contract = new ethers.Contract(
  "0x76be3b62873462d2142405439777e971754e8e77",
  parallel_alpha_abi,
  provider
);

module.exports = { alchemy, provider, parallel_alpha_contract };
