import { SlashCommandBuilder } from "discord.js";
import User from "../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your Orange balance"),

  async execute(interaction) {
    const user = await User.findOne({ discordId: interaction.user.id });
    interaction.reply(`🍊 **Your Balance:** ${user?.oranges || 0} Oranges`);
  }
};
