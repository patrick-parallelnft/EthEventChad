require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { parallel_alpha_contract } = require("./alchemy");

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
}
