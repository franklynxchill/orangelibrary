import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import User from "../models/User.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

export default {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Request a withdrawal of your Oranges")
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("Amount of Oranges to withdraw")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const user = await User.findOne({ discordId: interaction.user.id });
    if (!user) {
      return interaction.reply({ content: "You do not have an account yet.", ephemeral: true });
    }

    if (!user.orangeUsername) {
      return interaction.reply({
        content: "You must set your Orange Dynasty username first using `/setorange`.",
        ephemeral: true
      });
    }

    if (amount <= 0) {
      return interaction.reply({ content: "Amount must be greater than 0.", ephemeral: true });
    }

    if (user.oranges < amount) {
      return interaction.reply({
        content: `You do not have enough Oranges. Your balance: **${user.oranges}**`,
        ephemeral: true
      });
    }

    // Create the withdraw request
    const req = await WithdrawRequest.create({
      userId: user._id,
      discordId: interaction.user.id,
      username: interaction.user.username,
      amount,
      orangeUsername: user.orangeUsername
    });

    // Admin panel embed
    const embed = new EmbedBuilder()
      .setTitle(`Withdraw Request #${req._id}`)
      .setDescription(`A user has requested to withdraw Oranges.`)
      .addFields(
        { name: "User", value: `${interaction.user.tag}` },
        { name: "Amount", value: `${amount} Oranges` },
        { name: "Orange Username", value: user.orangeUsername },
        { name: "Status", value: "Pending" }
      )
      .setColor("Orange");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`withdraw_approve_${req._id}`)
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`withdraw_reject_${req._id}`)
        .setLabel("Reject")
        .setStyle(ButtonStyle.Danger)
    );

    // Send to admin channel
    const adminChannel = interaction.client.channels.cache.get(process.env.ADMIN_CHANNEL_ID);
    if (adminChannel) {
      adminChannel.send({ embeds: [embed], components: [row] });
    }

    return interaction.reply({
      content: "Your withdrawal request has been submitted and is pending admin approval.",
      ephemeral: true
    });
  }
};
