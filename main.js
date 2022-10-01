// Require the necessary discord.js classes
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { parallel_alpha_contract } = require("./alchemy");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function run() {
  // When the client is ready, run this code (only once)
  client.once("ready", async () => {
    console.log("Ready!");

    const channel = await client.channels.fetch("1025801908574748682");

    parallel_alpha_contract.on(
      "TransferBatch",
      (operartor, from, to, ids, values) => {
        channel.send(`TransferBatch Event
        operator ${operartor}
        from ${from}
        to ${to}
        ids ${ids}
        values ${values}`);
      }
    );

    parallel_alpha_contract.on(
      "TransferSingle",
      (operartor, from, to, id, value) => {
        channel.send(`TransferSingle Event
        operator ${operartor}
        from ${from}
        to ${to}
        id ${id}
        value ${value}`);
      }
    );
  });
}

run();

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
