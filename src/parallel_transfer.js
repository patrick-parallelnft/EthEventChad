const { bold, EmbedBuilder } = require("discord.js");
const { parallel_alpha_contract, provider } = require("./alchemy");
const cards = require("../data/cards.json");
const addreses = require("../data/known_address.json");
const R = require("ramda");
const ethers = require("ethers");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const OPENSEA_BULK_TRANFSER = "0x0000000000c2d145a2526bD8C716263bFeBe1A72";

// value could be 0 if paid by WETH
async function makeFields(operartor, maker, taker, res) {
  const fields = [
    {
      name: operartor === maker ? "From & Operartor" : "From",
      value: `[${
        addreses[maker] || maker
      }](https://etherscan.io/address/${maker})`,
    },
    {
      name: operartor === taker ? "To & Operartor" : "To",
      value: `[${
        addreses[taker] || taker
      }](https://etherscan.io/address/${taker})`,
    },
    operartor === taker || operartor === maker
      ? null
      : {
          name: "Operator",
          value: `[${
            addreses[operartor] || operartor
          }](https://etherscan.io/address/${operartor})`,
        },
    addreses[operartor] !== "Opensea"
      ? null
      : {
          name: "Value",
          value: await getOpenseaPrice(res, taker),
        },
  ].filter((it) => !!it);
  return fields;
}

async function getOpenseaPrice(res, taker) {
  const txn = await provider.getTransaction(res.transactionHash);
  const ethValue = ethers.utils.formatEther(txn.value);

  let wethValue = 0;
  let usdcValue = 0;
  let valueLabel = "Failed to fetch price";

  if (Number.parseFloat(ethValue) > 0) {
    valueLabel = `${ethValue} Ξ`;
  } else if (txn.to === OPENSEA_BULK_TRANFSER) {
    valueLabel = "Opensea bulk transfer";
  } else {
    const receipt = await provider.getTransactionReceipt(res.transactionHash);
    const wethLogs = receipt.logs.filter(
      (it) =>
        it.address === WETH &&
        it.topics[1].toLowerCase().includes(taker.substring(2).toLowerCase()) &&
        it.topics[2].toLowerCase().includes(txn.from.substring(2).toLowerCase())
    );

    if (wethLogs.length > 0) {
      wethValue = Number.parseInt(wethLogs[0].data) / 1e18;
      valueLabel = `${wethValue} WETH`;
    }

    const usdcLogs = receipt.logs.filter((it) => it.address === USDC);

    if (usdcLogs.length > 0) {
      usdcValue = Number.parseInt(usdcLogs[0].data) / 1e6;
      valueLabel = `${usdcValue} USDC`;
    }
  }

  return valueLabel;
}

async function listenToTransferBatch(channel) {
  parallel_alpha_contract.on(
    "TransferBatch",
    async (operartor, from, to, ids, values, res) => {
      const fields = await makeFields(operartor, from, to, res);
      const count = R.sum(values);

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Transfer batch")
        .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
        .setDescription(
          `${count === 1 ? "" : bold(`${count} cards:`) + "\n"} ${ids
            .map((id, i) => `${values[i]} ${cards[id].name}`)
            .join(", ")}`
        )
        .addFields(...fields)
        .setTimestamp();

      if (count === 1) {
        exampleEmbed.setImage(cards[ids[0]]?.image);
      }

      channel.send({ embeds: [exampleEmbed] });
    }
  );
}

async function listenToTransferSingle(channel) {
  parallel_alpha_contract.on(
    "TransferSingle",
    async (operartor, from, to, id, value, res) => {
      const fields = await makeFields(operartor, from, to, res);

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Transfer single")
        .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
        .setDescription(`${cards[id].name}`)
        .addFields(...fields)
        .setImage(cards[id]?.image)
        .setTimestamp();

      channel.send({ embeds: [exampleEmbed] });
    }
  );
}

async function mockTransferSingle(channel) {
  const operartor = "0x1E0049783F008A0085193E00003D00cd54003c71";
  const from = "0x15756a5fbe237e5d8644aa862b86501c4c6f242b";
  const to = "0x6300a843dbfc8f328da7db5b27cc50c796b3eca8";
  const id = 10464;
  const res = {
    transactionHash:
      "0xe6c161ee57eb3ab089330469f76941bf6192234ff162edbe639d7b89e2c190e8",
  };

  const fields = await makeFields(operartor, from, to, res);
  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Transfer single")
    .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
    .setDescription(`${cards[id].name}`)
    .addFields(...fields)
    .setImage(cards[id]?.image)
    .setTimestamp();

  channel.send({ embeds: [exampleEmbed] });
}

async function mockTransferBatch(channel) {
  const operartor = "0x1E0049783F008A0085193E00003D00cd54003c71";
  const from = "0x234";
  const to = "0x123";
  const ids = [9];
  const values = [1];
  const res = {
    transactionHash:
      "0x44fb3d62b212cde8ad608822654c34c2eb5d3e6e9b4a573ff8fe8dbbcac44960",
  };

  const fields = await makeFields(operartor, from, to, res);
  const count = R.sum(values);

  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Transfer batch")
    .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
    .setDescription(
      `${count === 1 ? "" : bold(`${count} cards:`) + "\n"} ${ids
        .map((id, i) => `${values[i]} ${cards[id].name}`)
        .join(", ")}`
    )
    .addFields(...fields)
    .setTimestamp();

  if (count === 1) {
    exampleEmbed.setImage(cards[ids[0]]?.image);
  }

  channel.send({ embeds: [exampleEmbed] });
}

module.exports = {
  listenToTransferBatch,
  listenToTransferSingle,
  mockTransferSingle,
  mockTransferBatch,
};
