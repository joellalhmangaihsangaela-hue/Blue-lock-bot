const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

// ==============================
// CONFIG
// ==============================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const OWNER_ID = "1467889781756133509";

// ==============================
// DATABASE
// ==============================

let db = {};

if (fs.existsSync("data.json")) {
  try {
    db = JSON.parse(fs.readFileSync("data.json", "utf8"));
  } catch {
    db = {};
  }
}

function save() {
  fs.writeFileSync("data.json", JSON.stringify(db, null, 2));
}

function getUser(id) {
  if (!db[id]) {
    db[id] = {
      coins: 1000,
      xp: 0,
      level: 1,

      character: null,
      class: null,

      wins: 0,
      losses: 0,

      stats: {
        shooting: 50,
        passing: 50,
        dribbling: 50,
        speed: 50,
        defense: 50,
        physical: 50,
        iq: 50
      },

      trophies: [],
      inventory: [],

      lastDaily: 0,
      lastTrain: 0
    };

    save();
  }

  return db[id];
}

function levelXP(level) {
  return level * 500;
}

function updateLevel(user) {
  while (user.xp >= levelXP(user.level)) {
    user.xp -= levelXP(user.level);
    user.level++;
  }
}

// ==============================
// CHARACTERS
// ==============================

const players = [

  // GOD / MASTER TIER

  {
    name: "Noel Noa",
    position: "ST",
    class: "Master Striker",
    rarity: "GOD",
    rating: 100,
    ability: "World's Best"
  },

  {
    name: "Julian Loki",
    position: "ST",
    class: "Master Striker",
    rarity: "GOD",
    rating: 100,
    ability: "Godspeed"
  },

  {
    name: "Michael Kaiser",
    position: "ST",
    class: "Striker",
    rarity: "MYTHIC",
    rating: 99,
    ability: "Kaiser Impact"
  },

  {
    name: "Sae Itoshi",
    position: "MF",
    class: "Playmaker",
    rarity: "MYTHIC",
    rating: 98,
    ability: "Perfect Pass"
  },

  {
    name: "Don Lorenzo",
    position: "DF",
    class: "Defender",
    rarity: "MYTHIC",
    rating: 97,
    ability: "Ace Eater"
  },

  // ELITE

  {
    name: "Yoichi Isagi",
    position: "ST",
    class: "Striker",
    rarity: "LEGENDARY",
    rating: 97,
    ability: "Meta Vision"
  },

  {
    name: "Rin Itoshi",
    position: "ST",
    class: "Striker",
    rarity: "LEGENDARY",
    rating: 98,
    ability: "Puppet Control"
  },

  {
    name: "Ryusei Shidou",
    position: "ST",
    class: "Striker",
    rarity: "LEGENDARY",
    rating: 97,
    ability: "Big Bang Drive"
  },

  {
    name: "Shoei Barou",
    position: "ST",
    class: "Striker",
    rarity: "LEGENDARY",
    rating: 96,
    ability: "Predator Eye"
  },

  {
    name: "Seishiro Nagi",
    position: "ST",
    class: "Striker",
    rarity: "LEGENDARY",
    rating: 96,
    ability: "Super Trap"
  },

  {
    name: "Meguru Bachira",
    position: "FW",
    class: "Dribbler",
    rarity: "LEGENDARY",
    rating: 95,
    ability: "Monster"
  },

  {
    name: "Hyoma Chigiri",
    position: "FW",
    class: "Speedster",
    rarity: "EPIC",
    rating: 94,
    ability: "44° Shot"
  },

  {
    name: "Rensuke Kunigami",
    position: "ST",
    class: "Power Striker",
    rarity: "EPIC",
    rating: 94,
    ability: "Lefty Shot"
  },

  {
    name: "Reo Mikage",
    position: "MF",
    class: "Copycat",
    rarity: "EPIC",
    rating: 94,
    ability: "Chameleon"
  },

  {
    name: "Yo Hiori",
    position: "MF",
    class: "Playmaker",
    rarity: "EPIC",
    rating: 93,
    ability: "Threaded Pass"
  },

  {
    name: "Tabito Karasu",
    position: "MF",
    class: "Midfielder",
    rarity: "EPIC",
    rating: 92,
    ability: "Ball Keeping"
  },

  {
    name: "Kenyu Yukimiya",
    position: "FW",
    class: "Dribbler",
    rarity: "EPIC",
    rating: 92,
    ability: "Gyro Shot"
  },

  {
    name: "Eita Otoya",
    position: "FW",
    class: "Speedster",
    rarity: "EPIC",
    rating: 91,
    ability: "Stealth"
  },

  {
    name: "Oliver Aiku",
    position: "DF",
    class: "Defender",
    rarity: "EPIC",
    rating: 93,
    ability: "Defensive IQ"
  },

  {
    name: "Jyubei Aryu",
    position: "DF",
    class: "Defender",
    rarity: "RARE",
    rating: 90,
    ability: "Aerial Reach"
  },

  {
    name: "Ikki Niko",
    position: "DF",
    class: "Defender",
    rarity: "RARE",
    rating: 89,
    ability: "Spatial Awareness"
  },

  {
    name: "Gin Gagamaru",
    position: "GK",
    class: "Goalkeeper",
    rarity: "EPIC",
    rating: 92,
    ability: "Super Save"
  },

  {
    name: "Aoshi Tokimitsu",
    position: "MF",
    class: "Physical",
    rarity: "RARE",
    rating: 87,
    ability: "Endurance"
  },

  {
    name: "Zantetsu Tsurugi",
    position: "FW",
    class: "Speedster",
    rarity: "RARE",
    rating: 86,
    ability: "Acceleration"
  },

  {
    name: "Jingo Raichi",
    position: "MF",
    class: "Defensive Midfielder",
    rarity: "RARE",
    rating: 86,
    ability: "Man Marking"
  },

  {
    name: "Gurimu Igarashi",
    position: "FW",
    class: "Striker",
    rarity: "COMMON",
    rating: 75,
    ability: "Malicia"
  },

  {
    name: "Charles Chevalier",
    position: "MF",
    class: "Playmaker",
    rarity: "EPIC",
    rating: 94,
    ability: "Creative Pass"
  },

  {
    name: "Alexis Ness",
    position: "MF",
    class: "Playmaker",
    rarity: "EPIC",
    rating: 91,
    ability: "Magic Pass"
  },

  // MASTER STRIKERS

  {
    name: "Marc Snuffy",
    position: "ST",
    class: "Master Striker",
    rarity: "GOD",
    rating: 98,
    ability: "Tactical Genius"
  },

  {
    name: "Chris Prince",
    position: "ST",
    class: "Master Striker",
    rarity: "GOD",
    rating: 98,
    ability: "Perfect Body"
  },

  {
    name: "Lavinho",
    position: "FW",
    class: "Master Striker",
    rarity: "GOD",
    rating: 98,
    ability: "Brazilian Dribble"
  }

];

// ==============================
// TROPHIES
// ==============================

const trophies = {

  ballon_dor: {
    name: "🏆 Ballon d'Or",
    description: "Best player in the world"
  },

  world_cup: {
    name: "🌎 World Cup",
    description: "World champion"
  },

  champions_league: {
    name: "🏆 Champions League",
    description: "European champion"
  },

  golden_boot: {
    name: "👟 Golden Boot",
    description: "Top scorer"
  },

  golden_glove: {
    name: "🧤 Golden Glove",
    description: "Best goalkeeper"
  },

  mvp: {
    name: "⭐ MVP",
    description: "Most valuable player"
  },

  player_of_year: {
    name: "👑 Player of the Year",
    description: "Player of the year"
  },

  league: {
    name: "🥇 League Champion",
    description: "League champion"
  },

  blue_lock: {
    name: "🔵 Blue Lock Champion",
    description: "Blue Lock champion"
  },

  neo_egoist: {
    name: "🔥 Neo Egoist League Champion",
    description: "Won the Neo Egoist League"
  }

};

// ==============================
// CLASSES
// ==============================

const classes = {

  Striker: {
    shooting: 15,
    dribbling: 10,
    iq: 10
  },

  Dribbler: {
    dribbling: 20,
    speed: 10
  },

  Speedster: {
    speed: 20,
    dribbling: 10
  },

  Playmaker: {
    passing: 20,
    iq: 15
  },

  Defender: {
    defense: 25,
    physical: 10
  },

  Goalkeeper: {
    defense: 25,
    iq: 15
  },

  "Master Striker": {
    shooting: 25,
    speed: 15,
    iq: 20
  }

};

// ==============================
// COMMANDS
// ==============================

const commands = [

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your Blue Lock profile"),

  new SlashCommandBuilder()
    .setName("players")
    .setDescription("View available Blue Lock players"),

  new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Choose a Blue Lock player")
    .addStringOption(option =>
      option
        .setName("player")
        .setDescription("Player name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("class")
    .setDescription("Choose your class")
    .addStringOption(option =>
      option
        .setName("class")
        .setDescription("Your class")
        .setRequired(true)
        .addChoices(
          { name: "Striker", value: "Striker" },
          { name: "Dribbler", value: "Dribbler" },
          { name: "Speedster", value: "Speedster" },
          { name: "Playmaker", value: "Playmaker" },
          { name: "Defender", value: "Defender" },
          { name: "Goalkeeper", value: "Goalkeeper" },
          { name: "Master Striker", value: "Master Striker" }
        )
    ),

  new SlashCommandBuilder()
    .setName("train")
    .setDescription("Train your player"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("View your coins"),

  new SlashCommandBuilder()
    .setName("match")
    .setDescription("Play a football match"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the leaderboard"),

  new SlashCommandBuilder()
    .setName("trophies")
    .setDescription("View your trophies"),

  new SlashCommandBuilder()
    .setName("gacha")
    .setDescription("Pull a random Blue Lock player"),

  new SlashCommandBuilder()
    .setName("owner-give")
    .setDescription("OWNER: Give coins")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount").setDescription("Amount").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("owner-xp")
    .setDescription("OWNER: Give XP")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount").setDescription("XP").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("owner-player")
    .setDescription("OWNER: Give a player")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("player").setDescription("Player").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("owner-trophy")
    .setDescription("OWNER: Give a trophy")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("trophy").setDescription("Trophy ID").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("owner-reset")
    .setDescription("OWNER: Reset a user")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("owner-announce")
    .setDescription("OWNER: Send an announcement")
    .addStringOption(option =>
      option.setName("message").setDescription("Message").setRequired(true)
    )

].map(command => command.toJSON());

// ==============================
// DISCORD CLIENT
// ==============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ==============================
// READY
// ==============================

client.once("ready", async () => {

  console.log(`⚽ Blue Lock Bot online as ${client.user.tag}`);

  const rest = new REST({ version: "10" })
    .setToken(TOKEN);

  try {

    if (GUILD_ID) {

      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID
        ),
        {
          body: commands
        }
      );

      console.log("Guild commands registered.");

    } else {

      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        {
          body: commands
        }
      );

      console.log("Global commands registered.");

    }

  } catch (error) {

    console.error(error);

  }

});

// ==============================
// INTERACTIONS
// ==============================

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const id = interaction.user.id;

  const user = getUser(id);

  // ============================
  // PROFILE
  // ============================

  if (interaction.commandName === "profile") {

    const player = players.find(
      p => p.name === user.character
    );

    const embed = new EmbedBuilder()
      .setTitle(`⚽ ${interaction.user.username}`)
      .setDescription(
        `**Player:** ${player ? player.name : "None"}\n` +
        `**Class:** ${user.class || "None"}\n` +
        `**Level:** ${user.level}\n` +
        `**XP:** ${user.xp}/${levelXP(user.level)}\n` +
        `**Coins:** 💰 ${user.coins}\n\n` +

        `**Stats**\n` +
        `⚽ Shooting: ${user.stats.shooting}\n` +
        `🎯 Passing: ${user.stats.passing}\n` +
        `🎨 Dribbling: ${user.stats.dribbling}\n` +
        `💨 Speed: ${user.stats.speed}\n` +
        `🛡️ Defense: ${user.stats.defense}\n` +
        `💪 Physical: ${user.stats.physical}\n` +
        `🧠 IQ: ${user.stats.iq}\n\n` +

        `**Record:** ${user.wins}W - ${user.losses}L\n` +
        `**Trophies:** ${user.trophies.length}`
      );

    return interaction.reply({
      embeds: [embed]
    });

  }

  // ============================
  // PLAYERS
  // ============================

  if (interaction.commandName === "players") {

    const text = players.map(
      p =>
        `**${p.name}** — ${p.rarity} — ${p.position} — ⭐ ${p.rating}`
    ).join("\n");

    const embed = new EmbedBuilder()
      .setTitle("⚽ Blue Lock Players")
      .setDescription(text);

    return interaction.reply({
      embeds: [embed]
    });

  }

  // ============================
  // CHOOSE
  // ============================

  if (interaction.commandName === "choose") {

    const input =
      interaction.options
        .getString("player")
        .toLowerCase();

    const player = players.find(
      p => p.name.toLowerCase() === input
    );

    if (!player) {

      return interaction.reply({
        content: "❌ That player doesn't exist.",
        ephemeral: true
      });

    }

    user.character = player.name;
    user.class = player.class;

    user.stats.shooting =
      Math.min(100, player.rating);

    user.stats.passing =
      Math.min(100, player.rating - 2);

    user.stats.dribbling =
      Math.min(100, player.rating - 3);

    user.stats.speed =
      Math.min(100, player.rating - 2);

    user.stats.defense =
      Math.min(100, player.rating - 5);

    user.stats.physical =
      Math.min(100, player.rating);

    user.stats.iq =
      Math.min(100, player.rating);

    save();

    return interaction.reply(
      `🔥 You chose **${player.name}**!\n` +
      `⭐ Rating: **${player.rating}**\n` +
      `✨ Ability: **${player.ability}**`
    );

  }

  // ============================
  // CLASS
  // ============================

  if (interaction.commandName === "class") {

    const selected =
      interaction.options.getString("class");

    user.class = selected;

    const bonus = classes[selected];

    for (const stat in bonus) {

      user.stats[stat] =
        Math.min(
          100,
          user.stats[stat] + bonus[stat]
        );

    }

    save();

    return interaction.reply(
      `🔥 Your class is now **${selected}**!\n` +
      `Your class bonuses have been applied.`
    );

  }

  // ============================
  // TRAIN
  // ============================

  if (interaction.commandName === "train") {

    const gain =
      Math.floor(Math.random() * 101) + 50;

    user.xp += gain;

    user.coins += 100;

    const stats = [
      "shooting",
      "passing",
      "dribbling",
      "speed",
      "physical",
      "iq"
    ];

    const stat =
      stats[Math.floor(Math.random() * stats.length)];

    user.stats[stat] =
      Math.min(
        100,
        user.stats[stat] + 2
      );

    updateLevel(user);

    save();

    return interaction.reply(
      `💪 **Training complete!**\n\n` +
      `+${gain} XP\n` +
      `+100 coins\n` +
      `+2 ${stat}`
    );

  }

  // ============================
  // DAILY
  // ============================

  if (interaction.commandName === "daily") {

    const now = Date.now();

    const day = 86400000;

    if (now - user.lastDaily < day) {

      return interaction.reply({
        content: "⏳ You already claimed your daily reward.",
        ephemeral: true
      });

    }

    user.lastDaily = now;

    user.coins += 1000;

    user.xp += 100;

    updateLevel(user);

    save();

    return interaction.reply(
      "🎁 **Daily Reward!**\n\n" +
      "💰 +1,000 coins\n" +
      "⭐ +100 XP"
    );

  }

  // ============================
  // BALANCE
  // ============================

  if (interaction.commandName === "balance") {

    return interaction.reply(
      `💰 You have **${user.coins} coins**.`
    );

  }

  // ============================
  // MATCH
  // ============================

  if (interaction.commandName === "match") {

    const player =
      players.find(
        p => p.name === user.character
      );

    if (!player) {

      return interaction.reply(
        "❌ Choose a player first using `/choose`."
      );

    }

    const power =
      player.rating +
      user.stats.shooting +
      user.stats.speed +
      user.stats.iq;

    const enemy =
      Math.floor(
        Math.random() * 300
      ) + 150;

    if (power >= enemy) {

      user.wins++;

      user.coins += 500;

      user.xp += 200;

      updateLevel(user);

      save();

      return interaction.reply(
        `🔥 **GOAL! YOU WON!**\n\n` +
        `⚽ ${player.name} dominated the match!\n` +
        `💰 +500 coins\n` +
        `⭐ +200 XP`
      );

    } else {

      user.losses++;

      user.xp += 50;

      updateLevel(user);

      save();

      return interaction.reply(
        `💀 **You lost the match.**\n\n` +
        `⭐ +50 XP`
      );

    }

  }

  // ============================
  // GACHA
  // ============================

  if (interaction.commandName === "gacha") {

    const price = 500;

    if (user.coins < price) {

      return interaction.reply({
        content: "❌ You need 500 coins.",
        ephemeral: true
      });

    }

    user.coins -= price;

    const roll =
      Math.random() * 100;

    let rarity;

    if (roll < 1) rarity = "GOD";
    else if (roll < 5) rarity = "MYTHIC";
    else if (roll < 20) rarity = "LEGENDARY";
    else if (roll < 50) rarity = "EPIC";
    else if (roll < 80) rarity = "RARE";
    else rarity = "COMMON";

    const possible =
      players.filter(
        p => p.rarity === rarity
      );

    const player =
      possible[
        Math.floor(
          Math.random() * possible.length
        )
      ] || players[players.length - 1];

    user.inventory.push(player.name);

    save();

    return interaction.reply(
      `🎰 **PLAYER PULL!**\n\n` +
      `${player.name}\n` +
      `✨ Rarity: **${player.rarity}**\n` +
      `⭐ Rating: **${player.rating}**\n` +
      `⚡ Ability: **${player.ability}**`
    );

  }

  // ============================
  // TROPHIES
  // ============================

  if (interaction.commandName === "trophies") {

    if (!user.trophies.length) {

      return interaction.reply(
        "🏆 You don't have any trophies yet."
      );

    }

    const list =
      user.trophies
        .map(id =>
          trophies[id]
            ? trophies[id].name
            : id
        )
        .join("\n");

    return interaction.reply(
      `🏆 **Your Trophies**\n\n${list}`
    );

  }

  // ============================
  // LEADERBOARD
  // ============================

  if (interaction.commandName === "leaderboard") {

    const leaderboard =
      Object.entries(db)
        .sort(
          (a, b) =>
            (b[1].level - a[1].level) ||
            (b[1].wins - a[1].wins)
        )
        .slice(0, 10);

    let text = "";

    leaderboard.forEach(
      ([id, player], index) => {

        text +=
          `**${index + 1}.** <@${id}> — ` +
          `Level ${player.level} — ` +
          `${player.wins} wins\n`;

      }
    );

    return interaction.reply(
      `🏆 **Blue Lock Leaderboard**\n\n${text}`
    );

  }

  // ============================
  // OWNER CHECK
  // ============================

  if (
    interaction.commandName.startsWith("owner-") &&
    id !== OWNER_ID
  ) {

    return interaction.reply({
      content: "❌ This command is owner-only.",
      ephemeral: true
    });

  }

  // ============================
  // OWNER GIVE
  // ============================

  if (interaction.commandName === "owner-give") {

    const target =
      interaction.options.getUser("user");

    const amount =
      interaction.options.getInteger("amount");

    const targetData =
      getUser(target.id);

    targetData.coins += amount;

    save();

    return interaction.reply(
      `👑 Gave **${amount} coins** to ${target}.`
    );

  }

  // ============================
  // OWNER XP
  // ============================

  if (interaction.commandName === "owner-xp") {

    const target =
      interaction.options.getUser("user");

    const amount =
      interaction.options.getInteger("amount");

    const targetData =
      getUser(target.id);

    targetData.xp += amount;

    updateLevel(targetData);

    save();

    return interaction.reply(
      `👑 Gave **${amount} XP** to ${target}.`
    );

  }

  // ============================
  // OWNER PLAYER
  // ============================

  if (interaction.commandName === "owner-player") {

    const target =
      interaction.options.getUser("user");

    const input =
      interaction.options
        .getString("player")
        .toLowerCase();

    const player =
      players.find(
        p => p.name.toLowerCase() === input
      );

    if (!player) {

      return interaction.reply(
        "❌ Player not found."
      );

    }

    const targetData =
      getUser(target.id);

    targetData.character =
      player.name;

    targetData.class =
      player.class;

    save();

    return interaction.reply(
      `👑 ${target} is now **${player.name}**.`
    );

  }

  // ============================
  // OWNER TROPHY
  // ============================

  if (interaction.commandName === "owner-trophy") {

    const target =
      interaction.options.getUser("user");

    const trophy =
      interaction.options.getString("trophy");

    if (!trophies[trophy]) {

      return interaction.reply(
        "❌ Invalid trophy ID."
      );

    }

    const targetData =
      getUser(target.id);

    if (!targetData.trophies.includes(trophy)) {

      targetData.trophies.push(trophy);

    }

    save();

    return interaction.reply(
      `👑 Awarded **${trophies[trophy].name}** to ${target}.`
    );

  }

  // ============================
  // OWNER RESET
  // ============================

  if (interaction.commandName === "owner-reset") {

    const target =
      interaction.options.getUser("user");

    delete db[target.id];

    save();

    return interaction.reply(
      `👑 Reset ${target}'s profile.`
    );

  }

  // ============================
  // OWNER ANNOUNCE
  // ============================

  if (interaction.commandName === "owner-announce") {

    const message =
      interaction.options.getString("message");

    await interaction.channel.send(
      `📢 **BLUE LOCK ANNOUNCEMENT**\n\n${message}`
    );

    return interaction.reply({
      content: "✅ Announcement sent.",
      ephemeral: true
    });

  }

});

// ==============================
// LOGIN
// ==============================

if (!TOKEN) {

  console.error(
    "❌ DISCORD_TOKEN is missing!"
  );

  process.exit(1);

}

client.login(TOKEN);
