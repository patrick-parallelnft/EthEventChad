require("dotenv").config();

const { Client, GatewayIntentBits, bold } = require("discord.js");
const { parallel_alpha_contract } = require("./alchemy");
const cards = require("./data/cards.json");
const R = require("ramda");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log("Ready!");

  listenToTransferEvents();
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

async function listenToTransferEvents() {
  const channel = await client.channels.fetch(process.env.CHANNEL_TEST_BOT);

  parallel_alpha_contract.on(
    "TransferBatch",
    (operartor, from, to, ids, values, hash) => {
      channel.send(
        `${bold("Transfer batch:")}
${bold(`${R.sum(values)} cards:`)} 
${ids
  .map((id, i) => `${values[i]} ${cards[id].name}`)
  .join(", ")} have been transfered.
${bold(`From:`)} ${from}
${bold(`To:`)} ${to}
${bold("Operator:")} ${operartor}
${bold("Hash:")} ${hash.toString()}`
      );
    }
  );

  parallel_alpha_contract.on(
    "TransferSingle",
    (operartor, from, to, id, value, hash) => {
      channel.send(
        `${bold("Transfer single:")}
${bold(`${value} card:`)}
${cards[id].name} has been transfered. 
${bold(`From:`)} ${from}
${bold(`To:`)} ${to}
${bold("Operator:")} ${operartor}
${bold("Hash:")} ${hash.toString()}`,
        {
          files: [cards[id]?.image],
        }
      );
    }
  );
}
