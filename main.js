require("dotenv").config();

const { Client, GatewayIntentBits, bold, EmbedBuilder } = require("discord.js");
const { parallel_alpha_contract, provider } = require("./alchemy");
const cards = require("./data/cards.json");
const addreses = require("./data/known_address.json");
const R = require("ramda");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log("Ready!");
  const channel = await client.channels.fetch(process.env.CHANNEL_TEST_BOT);

  listenToTransferBatch(channel);
  listenToTransferSingle(channel);
  //   mockTransferSingle(channel);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

// value could be 0 if paid by WETH
async function getTxnValue(hash) {
  const txn = await provider.getTransaction(hash);
  return txn.value.toString();
}

async function makeFields(operartor, from, to, res) {
  const fields = [
    {
      name: operartor === from ? "From & Operartor" : "From",
      value: `[${
        addreses[from] || from
      }](https://etherscan.io/address/${from})`,
    },
    {
      name: operartor === to ? "To & Operartor" : "To",
      value: `[${addreses[to] || to}](https://etherscan.io/address/${to})`,
    },
    operartor === to || operartor === from
      ? null
      : {
          name: "Operator",
          value: addreses[operartor] ?? operartor,
        },
    addreses[operartor] !== "Opensea"
      ? null
      : {
          name: "Value",
          value: await getTxnValue(res.transactionHash),
        },
  ].filter((it) => !!it);
  console.log("fileds", fields);
  return fields;
}

async function listenToTransferBatch(channel) {
  parallel_alpha_contract.on(
    "TransferBatch",
    async (operartor, from, to, ids, values, res) => {
      const fields = await makeFields(operartor, from, to, res);

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Transfer batch")
        .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
        .setDescription(
          `${bold(`${R.sum(values)} cards:`)}\n${ids
            .map((id, i) => `${values[i]} ${cards[id].name}`)
            .join(", ")}`
        )
        .addFields(...fields)
        .setTimestamp();

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
  const operartor = "0x234";
  const from = "0x234";
  const to = "0x123";
  const id = 9;
  const res = {
    transactionHash: "0x456",
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
