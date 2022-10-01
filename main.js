// Require the necessary discord.js classes
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");

  client.channels.fetch("1025801908574748682").then((channel) => {
    channel.send("I am rebooted!");
  });
});

// Login to Discord with your client's token
console.log("DISCORD_TOKEN", process.env.DISCORD_TOKEN);

client.login(process.env.DISCORD_TOKEN);
