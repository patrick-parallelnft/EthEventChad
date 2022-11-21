const { EmbedBuilder } = require("discord.js");
const addreses = require("../data/known_address.json");

const handle_webhook = (channel, message) => {
  const activity = message.event?.activity;

  let fields = [
    {
      name: "Event type",
      value: message.type,
    },
  ];

  for (let i = 0; i < activity?.length; i++) {
    const a = activity[i];
    fields.push({
      name: `activity #`,
      value: i + 1 + "",
    });
    a.fromAddress &&
      fields.push({
        name: "from",
        value: `[${
          addreses[a.fromAddress?.toLowerCase()] || a.fromAddress?.toLowerCase()
        }](https://etherscan.io/address/${a.fromAddress})`,
      });
    a.toAddress &&
      fields.push({
        name: "to",
        value: `[${
          addreses[a.toAddress?.toLowerCase()] || a.toAddress?.toLowerCase()
        }](https://etherscan.io/address/${a.toAddress})`,
      });
    a.asset &&
      fields.push({
        name: "asset",
        value: a.asset,
      });
    a.value !== undefined &&
      fields.push({
        name: "value",
        value: a.value + "",
      });
    a.hash &&
      fields.push({
        name: "hash",
        value: `https://etherscan.io/tx/${a.hash}`,
      });
    a.erc1155Metadata &&
      fields.push({
        name: "ERC1155",
        value: JSON.stringify(a.erc1155Metadata),
      });
  }

  if (fields.length > 25) {
    fields = fields.splice(0, 25);
  }

  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(message.webhookId)
    .addFields(...fields)
    .setTimestamp();

  channel.send({ embeds: [exampleEmbed] });
};

module.exports = {
  handle_webhook,
};
