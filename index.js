const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

// =====================================================
// CONFIG
// =====================================================

const TOKEN = process.env.DISCORD_TOKEN;
const OWNER_ID = "1467889781756133509";
const PREFIX = ",";

// =====================================================
// CLIENT
// =====================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =====================================================
// DATABASE
// =====================================================

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
      coins: 5000,
      xp: 0,
      level: 1,

      character: null,
      class: null,

      wins: 0,
      losses: 0,
      goals: 0,

      stats: {
        shooting: 50,
        passing: 50,
        dribbling: 50,
        speed: 50,
        defense: 50,
        physical: 50,
        iq: 50
      },

      inventory: [],
      trophies: [],

      pity: 0,
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

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findPlayer(name) {
  const search = name.toLowerCase();

  return players.find(
    p => p.name.toLowerCase() === search
  ) || players.find(
    p => p.name.toLowerCase().includes(search)
  );
}

function owner(message) {
  return message.author.id === OWNER_ID;
}

// =====================================================
// PLAYERS
// =====================================================

const players = [

  // =========================
  // MASTER STRIKERS
  // =========================

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
    name: "Marc Snuffy",
    position: "ST",
    class: "Master Striker",
    rarity: "GOD",
    rating: 99,
    ability: "Tactical Genius"
  },

  {
    name: "Chris Prince",
    position: "ST",
    class: "Master Striker",
    rarity: "GOD",
    rating: 99,
    ability: "Perfect Body"
  },

  {
    name: "Lavinho",
    position: "FW",
    class: "Master Striker",
    rarity: "GOD",
    rating: 98,
    ability: "Brazilian Dribble"
  },

  // =========================
  // NEW GENERATION WORLD XI
  // =========================

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

  // =========================
  // BLUE LOCK ELITE
  // =========================

  {
    name: "Yoichi Isagi",
    position: "ST",
    class: "Striker",
    rarity: "MYTHIC",
    rating: 98,
    ability: "Meta Vision"
  },

  {
    name: "Rin Itoshi",
    position: "ST",
    class: "Striker",
    rarity: "MYTHIC",
    rating: 98,
    ability: "Puppet Control"
  },

  {
    name: "Ryusei Shidou",
    position: "ST",
    class: "Striker",
    rarity: "MY
