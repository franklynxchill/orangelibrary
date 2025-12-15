import { SlashCommandBuilder } from "discord.js";
import User from "../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setorange")
    .setDescription("Set your Orange Dynasty username")
    .addStringOption(o =>
      o.setName("username")
        .setDescription("Your Orange Dynasty username")
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString("username");

    let user = await User.findOne({ discordId: interaction.user.id });
    if (!user) {
      user = await User.create({
        discordId: interaction.user.id,
        username: interaction.user.username
      });
    }

    user.orangeUsername = username;
    await user.save();

    return interaction.reply({
      content: `Your Orange Dynasty username has been set to **${username}**.`,
      ephemeral: true
    });
  }
};
