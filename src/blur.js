const { ZenRows } = require("zenrows");

let cached_ids = [];

async function fetch_parallel(channel) {
  const client = new ZenRows(process.env.ZENROWS_KEY);
  const url =
    "https://core-api.prod.blur.io/v1/activity/global?filters=%7B%22count%22%3A100%2C%22eventTypes%22%3A%5B%22ORDER_CREATED%22%2C%22SALE%22%5D%2C%22contractAddresses%22%3A%5B%220x0fc3dd8c37880a297166bed57759974a157f0e74%22%5D%7D";

  await get(client, url);
  setInterval(() => get(client, url), 1000 * 60);
}

async function get(client, url) {
  try {
    const { data } = await client.get(url, {});
    handle_data(data.activityItems);
  } catch (error) {
    console.error(error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

function handle_data(activities) {
  const ids = activities.map((it) => it.id);
  if (cached_ids.length == 0) {
    cached_ids = ids;
    console.log(`Fill ${cached_ids.length} cached ids`, cached_ids);
  } else {
    const new_ids = ids.filter((it) => !cached_ids.includes(it));
    if (new_ids.length > 0) {
      new_ids.forEach((it) => {
        console.log(activities.find((d) => d.id == it));
      });
      cached_ids += new_ids;
      cached_ids = cached_ids.slice(new_ids);
    } else {
      console.log(new Date().getTime(), "no new ids found");
    }
  }
}

module.exports = {
  fetch_parallel,
};
