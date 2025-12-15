import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import Lesson from "../models/Lesson.js";

export default {
  data: new SlashCommandBuilder()
    .setName("addquiz")
    .setDescription("Create quiz (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("question").setRequired(true).setDescription("Question"))
    .addStringOption(o => o.setName("a").setRequired(true).setDescription("Option A"))
    .addStringOption(o => o.setName("b").setRequired(true).setDescription("Option B"))
    .addStringOption(o => o.setName("c").setRequired(true).setDescription("Option C"))
    .addStringOption(o => o.setName("answer").setRequired(true).setDescription("Correct answer")),

  async execute(interaction) {
    const q = interaction.options.getString("question");
    const A = interaction.options.getString("a");
    const B = interaction.options.getString("b");
    const C = interaction.options.getString("c");
    const ans = interaction.options.getString("answer");

    await Lesson.create({
      question: q,
      options: [A, B, C],
      correctAnswer: ans
    });

    interaction.reply("✅ Quiz added successfully!");
  }
};
