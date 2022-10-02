require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const {
  listenToTransferBatch,
  listenToTransferSingle,
} = require("./src/parallel_transfer.js");

const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.send("live"));

app.post("/webhook", async (req, res) => {
  const channel = await client.channels.fetch(process.env.CHANNEL_WEBHOOK);
  channel.send(`Webhook body: ${JSON.stringify(req.body)}`);
  res.send(req.body);
});

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
