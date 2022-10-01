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
      console.log("res", JSON.stringify(res));

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Trasfer batch")
        .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
        .setDescription(
          `${bold(`${R.sum(values)} cards:`)} ${ids
            .map((id, i) => `${values[i]} ${cards[id].name}`)
            .join(", ")} have been transfered.`
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
      console.log("res", JSON.stringify(res));

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Trasfer single")
        .setURL(`https://etherscan.io/tx/${res.transactionHash}`)
        .setDescription(
          `${bold(`1 card:`)} ${cards[id].name} has been transfered.`
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
        .setImage(cards[id]?.image)
        .setTimestamp();

      channel.send({ embeds: [exampleEmbed] });
    }
  );
}
