require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const {
  listenToTransferBatch,
  listenToTransferSingle,
  mockTransferSingle,
} = require("./src/parallel_transfer.js");
const { provider } = require("./src/alchemy.js");

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
  // mockTransferSingle(channel);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
