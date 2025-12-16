import { SlashCommandBuilder } from "discord.js";
import User from "../models/User.js";

const DAILY_REWARD = 10; // Oranges per claim

export default {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily Oranges 🍊"),

  async execute(interaction) {
    const discordId = interaction.user.id;
    let user = await User.findOne({ discordId });

    if (!user) {
      user = await User.create({
        discordId,
        username: interaction.user.username
      });
    }

    const now = new Date();

    // ✅ First time claim
    if (!user.lastDaily) {
      user.lastDaily = now;
      user.oranges += DAILY_REWARD;
      await user.save();

      return interaction.reply(
        `🎁 **Daily Reward Claimed!**\nYou received **${DAILY_REWARD} Oranges 🍊**`
      );
    }

    const diff = now - user.lastDaily;
    const hours = diff / (1000 * 60 * 60);

    // ✅ Cooldown check (24h)
    if (hours < 24) {
      const timeLeft = Math.ceil(24 - hours);
      return interaction.reply({
        content: `⏳ You already claimed today.\nCome back in **${timeLeft} hour(s)**.`,
        ephemeral: true
      });
    }

    // ✅ Reward available
    user.lastDaily = now;
    user.oranges += DAILY_REWARD;
    await user.save();

    return interaction.reply(
      `🎁 **Daily Reward Claimed!**\nYou received **${DAILY_REWARD} Oranges 🍊**`
    );
  }
};
