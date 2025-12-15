import { Client, GatewayIntentBits, Events } from "discord.js";
import "dotenv/config";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Slash command interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    try {
      await interaction.reply("🏓 Pong! I’m alive and ready.");
    } catch (error) {
      console.error("❌ Error replying:", error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
