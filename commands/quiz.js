import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import User from "../models/User.js";
import { Lesson } from "../models/Lesson.js";
import { checkCooldown } from "../utils/cooldown.js";


function encode(str) {
  return Buffer.from(str).toString("base64");
}

export default {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("Answer quiz questions to earn Oranges"),

  async execute(interaction) {
    const discordId = interaction.user.id;
    let user = await User.findOne({ discordId });

    if (!user) {
      user = await User.create({
        discordId,
        username: interaction.user.username,
      });
    }

    const lesson = lessons[Math.floor(Math.random() * lessons.length)];
    const quiz = lesson.quiz;

    // Buttons with encoded IDs
    const row = new ActionRowBuilder().addComponents(
      quiz.options.map((opt) =>
        new ButtonBuilder()
          .setCustomId(`quiz_${lesson.id}_${encode(opt)}`)
          .setLabel(opt)
          .setStyle(ButtonStyle.Primary)
      )
    );

    if (checkCooldown(user.cooldowns?.quiz, 60)) {
      return interaction.reply({
        content: "⏳ Wait before taking another quiz.",
        ephemeral: true
      });
    }

    user.cooldowns.quiz = new Date();
    await user.save();


    // Save active quiz
    user.currentQuiz = {
      lessonId: lesson.id,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 mins
    };
    await user.save();

    // Reply with new API standard
    const msg = await interaction.reply({
      content: `🧠 **QUIZ TIME!**\n\n⏳ You have **5 minutes**.\n\n❓ ${quiz.question}`,
      components: [row],
      fetchReply: true, // temporary, you can later use withResponse
    });

    // Disable after 5 minutes
    setTimeout(async () => {
      try {
        await msg.edit({
          content: "⏰ **Time is up! You didn’t answer in time.**",
          components: [],
        });
      } catch {}
    }, 5 * 60 * 1000);
  },
};
