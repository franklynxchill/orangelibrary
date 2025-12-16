import { SlashCommandBuilder } from "discord.js";
import { lessons } from "../utils/lessonData.js";

export default {
  data: new SlashCommandBuilder()
    .setName("read")
    .setDescription("Read a crypto lesson"),

  async execute(interaction) {
    const lesson = lessons[Math.floor(Math.random() * lessons.length)];
    await interaction.reply(
      `📘 **${lesson.title}**\n\n${lesson.content}\n\nUse **/quiz** to answer questions!`
    );
  }
};
