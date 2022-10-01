require("dotenv").config();

const { Client, GatewayIntentBits, bold, EmbedBuilder } = require("discord.js");
const { parallel_alpha_contract } = require("./alchemy");
const cards = require("./data/cards.json");
const addreses = require("./data/known_address.json");
const R = require("ramda");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log("Ready!");
  const channel = await client.channels.fetch(process.env.CHANNEL_TEST_BOT);

  listenToTransferBatch(channel);
  listenToTransferSingle(channel);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

async function listenToTransferBatch(channel) {
  parallel_alpha_contract.on(
    "TransferBatch",
    (operartor, from, to, ids, values, res) => {
      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Transfer batch")
        .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
        .setDescription(
          `${bold(`${R.sum(values)} cards:`)}\n${ids
            .map((id, i) => `${values[i]} ${cards[id].name}`)
            .join(", ")}`
        )
        .addFields(
          { name: "From", value: from },
          {
            name: "To",
            value: to,
          },
          {
            name: "Operator",
            value: addreses[operartor] ?? operartor,
          }
        )
        .setTimestamp();

      channel.send({ embeds: [exampleEmbed] });
    }
  );
}

async function listenToTransferSingle(channel) {
  parallel_alpha_contract.on(
    "TransferSingle",
    (operartor, from, to, id, value, res) => {
      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Transfer single")
        .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
        .setDescription(`${cards[id].name}`)
        .addFields(
          { name: "From", value: from },
          {
            name: "To",
            value: to,
          },
          {
            name: "Operator",
            value: addreses[operartor] ?? operartor,
          }
        )
        .setImage(cards[id]?.image)
        .setTimestamp();

      channel.send({ embeds: [exampleEmbed] });
    }
  );
}
