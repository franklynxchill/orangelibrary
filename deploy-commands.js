import "dotenv/config";
import { REST, Routes } from "discord.js";
import start from "./commands/start.js";
import balance from "./commands/balance.js";
import read from "./commands/read.js";
import quiz from "./commands/quiz.js";
import leaderboard from "./commands/leaderboard.js";

const commands = [
  start.data,
  balance.data,
  read.data,
  quiz.data,
  leaderboard.data
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function deploy() {
  try {
    console.log("Deploying slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Commands deployed!");
  } catch (err) {
    console.error(err);
  }
}

deploy();
