import { SlashCommandBuilder } from "discord.js";
import User from "../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("View your earnings history"),

  async execute(interaction) {
    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user || user.history.length === 0) {
      return interaction.reply("📭 No history yet.");
    }

    const logs = user.history
      .slice(-10)
      .map(h => `• ${h.type.toUpperCase()} | ${h.amount} 🍊 | ${h.reason}`)
      .join("\n");

    interaction.reply(`📜 **Recent Earnings**\n\n${logs}`);
  }
};
