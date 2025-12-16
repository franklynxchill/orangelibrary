import { SlashCommandBuilder } from "discord.js";
import User from "../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top Orange earners"),

  async execute(interaction) {
    const top = await User.find().sort({ oranges: -1 }).limit(10);
    const text = top.map((u, i) => `${i+1}. **${u.username}** — ${u.oranges} 🍊`).join("\n");
    interaction.reply(`🏆 **Top Players**\n\n${text}`);
  }
};
