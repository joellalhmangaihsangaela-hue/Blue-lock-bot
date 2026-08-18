const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = ",";

const OWNER_ID = "1467889781756133509";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// DATABASE
// ==============================

let db = {};

if (fs.existsSync("data.json")) {
  try {
    db = JSON.parse(
      fs.readFileSync("data.json", "utf8")
    );
  } catch {
    db = {};
  }
}

function save() {
  fs.writeFileSync(
    "data.json",
    JSON.stringify(db, null, 2)
  );
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

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
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
// PLAYERS
// ==============================

const players = [
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
    rarity: "MYTHIC",
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
    class: "Trapper",
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
    rarity: "LEGENDARY",
    rating: 94,
    ability: "44 Degree Shot"
  },

  {
    name: "Rensuke Kunigami",
    position: "ST",
    class: "Power Striker",
    rarity: "LEGENDARY",
    rating: 94,
    ability: "Lefty Shot"
  },

  {
    name: "Reo Mikage",
    position: "MF",
    class: "Copycat",
    rarity: "LEGENDARY",
    rating: 94,
    ability: "Chameleon"
  },

  {
    name: "Charles Chevalier",
    position: "MF",
    class: "Playmaker",
    rarity: "LEGENDARY",
    rating: 94,
    ability: "Creative Pass"
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
    name: "Yo Hiori",
    position: "MF",
    class: "Playmaker",
    rarity: "EPIC",
    rating: 93,
    ability: "Threaded Pass"
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
    name: "Kenyu Yukimiya",
    position: "FW",
    class: "Dribbler",
    rarity: "EPIC",
    rating: 92,
    ability: "Gyro Shot"
  },

  {
    name: "Tabito Karasu",
    position: "MF",
    class: "Playmaker",
    rarity: "EPIC",
    rating: 92,
    ability: "Ball Keeping"
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
    name: "
