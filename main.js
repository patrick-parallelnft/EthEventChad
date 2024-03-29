require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const {
  listenToTransferBatch,
  listenToTransferSingle,
} = require("./src/parallel_transfer.js");
const { fetch_parallel } = require("./src/blur.js");
const { provider } = require("./src/alchemy.js");
const { handle_webhook } = require("./src/webhook_handler");

const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.send("live"));

app.get("/transaction", async (req, res) => {
  if (req.query.hash) {
    res.send(await provider.getTransaction(req.query.hash));
  } else {
    res.send({ error: "Hash not found" });
  }
});

app.get("/transactionReceipt", async (req, res) => {
  if (req.query.hash) {
    res.send(await provider.getTransactionReceipt(req.query.hash));
  } else {
    res.send({ error: "Hash not found" });
  }
});

app.post("/webhook", async (req, res) => {
  const channel = await client.channels.fetch(process.env.CHANNEL_WEBHOOK);
  handle_webhook(channel, req.body);
  res.send({ status: "ok" });
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

  // listenToTransferBatch(channel);
  // listenToTransferSingle(channel);
  fetch_parallel(channel);
});

client.login(process.env.DISCORD_TOKEN);
