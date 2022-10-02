require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const {
  listenToTransferBatch,
  listenToTransferSingle,
} = require("./src/parallel_transfer.js");

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.send("live"));

app.listen(port, () =>
  console.log(`Eth Event Chad listening on port ${port}!`)
);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log("Ready!");
  const channel = await client.channels.fetch(
    process.env.CHANNEL_PARALLEL_TRANSFER_EVENT
  );

  listenToTransferBatch(channel);
  listenToTransferSingle(channel);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
