const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "-";
const OWNER_ID = "1467889781756133509";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`⚽ ${client.user.tag} is online!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const command = args.shift().toLowerCase();

  if (command === "help") {
    return message.reply(
      "⚽ **BLUE LOCK BOT**\n\n" +
      "`-help` — Show commands\n" +
      "`-ping` — Check bot status\n" +
      "`-owner` — Owner test"
    );
  }

  if (command === "ping") {
    return message.reply("🏓 Pong!");
  }

  if (command === "owner") {
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Owner only.");
    }

    return message.reply("👑 Owner command works!");
  }
});

if (!TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing!");
  process.exit(1);
}

client.login(TOKEN);
