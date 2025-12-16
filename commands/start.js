import { SlashCommandBuilder } from "discord.js";
import User from "../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Register for Orange Library"),

  async execute(interaction) {
    const discordId = interaction.user.id;

    let user = await User.findOne({ discordId });
    if (!user) {
      user = await User.create({
        discordId,
        username: interaction.user.username
      });
    }

    interaction.reply(`👋 Welcome **${interaction.user.username}**!  
You are now registered for Orange Library.`);
  }
};
