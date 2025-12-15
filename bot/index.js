import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import startCmd from "./commands/start.js";
import readCmd from "./commands/read.js";
import quizCmd from "./commands/quiz.js";
import balanceCmd from "./commands/balance.js";
import leaderboardCmd from "./commands/leaderboard.js";
import dailyCmd from "./commands/daily.js";
import historyCmd from "./commands/history.js";
import addQuizCmd from "./commands/addquiz.js";



import User from "./models/User.js";
import { lessons } from "./utils/lessonData.js";
import { connectDB } from "./utils/db.js";
import WithdrawRequest from "./models/WithdrawRequest.js";

/* -------------------------------------------------------------
   0️⃣ Connect MongoDB
------------------------------------------------------------- */
await connectDB();

/* -------------------------------------------------------------
   1️⃣ Create Discord Client
------------------------------------------------------------- */
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

/* -------------------------------------------------------------
   2️⃣ Ready Event (Updated)
------------------------------------------------------------- */
client.on("clientReady", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // Register all slash commands
  await client.application.commands.set([
    startCmd.data,
    readCmd.data,
    quizCmd.data,
    balanceCmd.data,
    leaderboardCmd.data,
    dailyCmd.data, // ✅ NEW
    historyCmd.data,
    addQuizCmd.data,
    setorangeCmd.data,
    withdrawCmd.data,
  ]);

  console.log("✅ Commands registered");
});

/* -------------------------------------------------------------
   3️⃣ Interaction Handler
------------------------------------------------------------- */
client.on("interactionCreate", async (interaction) => {
  /* -------------------
     BUTTON HANDLER
  ------------------- */
  if (interaction.isButton()) {
    try {
      // ------------------------------------------------------------
      // 1️⃣ WITHDRAW BUTTON HANDLER (APPROVE / REJECT)
      // ------------------------------------------------------------
      if (interaction.customId.startsWith("withdraw_approve_")) {
        const reqId = interaction.customId.replace("withdraw_approve_", "");
        const req = await WithdrawRequest.findById(reqId);

        if (!req || req.status !== "pending") {
          return interaction.reply({ content: "This request is no longer valid.", ephemeral: true });
        }

        req.status = "approved";
        req.resolvedAt = new Date();
        await req.save();

        const user = await User.findOne({ discordId: req.discordId });
        user.oranges -= req.amount;
        await user.save();

        await interaction.update({
          content: `Withdrawal #${reqId} approved. Manually send **${req.amount}** Oranges to **${req.orangeUsername}**.`,
          components: []
        });

        const member = await interaction.client.users.fetch(req.discordId);
        member.send(`Your withdrawal of **${req.amount} Oranges** has been approved.`)
          .catch(() => null);

        return;
      }

      if (interaction.customId.startsWith("withdraw_reject_")) {
        const reqId = interaction.customId.replace("withdraw_reject_", "");
        const req = await WithdrawRequest.findById(reqId);

        if (!req || req.status !== "pending") {
          return interaction.reply({ content: "This request is no longer valid.", ephemeral: true });
        }

        req.status = "rejected";
        req.resolvedAt = new Date();
        await req.save();

        await interaction.update({
          content: `Withdrawal #${reqId} rejected.`,
          components: []
        });

        const member = await interaction.client.users.fetch(req.discordId);
        member.send(`Your withdrawal request for **${req.amount} Oranges** was rejected.`)
          .catch(() => null);

        return;
      }

      // ------------------------------------------------------------
      // 2️⃣ QUIZ BUTTON LOGIC (YOUR EXISTING LOGIC)
      // ------------------------------------------------------------
      const [prefix, lessonId, encoded] = interaction.customId.split("_");

      if (prefix === "expired") {
        return interaction.reply({
          content: "⏰ This quiz already expired!",
          ephemeral: true,
        });
      }

      if (prefix !== "quiz") return;

      const user = await User.findOne({ discordId: interaction.user.id });
      if (!user || !user.currentQuiz) {
        return interaction.reply({
          content: "⏰ Quiz expired!",
          ephemeral: true,
        });
      }

      if (Date.now() > user.currentQuiz.expiresAt) {
        user.currentQuiz = null;
        await user.save();
        return interaction.reply({
          content: "⏰ Time is up!",
          ephemeral: true,
        });
      }

      const answer = Buffer.from(encoded, "base64").toString("utf8");
      const lesson = lessons.find((l) => l.id === Number(lessonId));
      const correct = lesson.quiz.correctAnswer;

      user.currentQuiz = null;

      if (answer === correct) {
        user.oranges += 5;
        user.history.push({
          type: "quiz",
          amount: 5,
          reason: "Correct quiz answer"
        });
        await user.save();
        return interaction.update({
          content: `🎉 Correct! You chose **${answer}** and earned **5 Oranges! 🍊**`,
          components: [],
        });
      } else {
        await user.save();
        return interaction.update({
          content: `❌ Wrong! You chose **${answer}**. Correct answer: **${correct}**.`,
          components: [],
        });
      }

    } catch (err) {
      console.error("BUTTON ERROR:", err);
      if (!interaction.replied) {
        return interaction.reply({ content: "⚠ Error", ephemeral: true });
      }
    }
    return;
  }

  /* -------------------
     SLASH COMMAND HANDLER
  ------------------- */
  if (!interaction.isChatInputCommand()) return;

  const commands = {
    start: startCmd,
    read: readCmd,
    quiz: quizCmd,
    balance: balanceCmd,
    leaderboard: leaderboardCmd,
    daily: dailyCmd, // ✅ NEW
    history: historyCmd,
    addquiz: addQuizCmd,
    setorange: setorangeCmd,
    withdraw: withdrawCmd,
  };

  const cmd = commands[interaction.commandName];
  if (cmd) return cmd.execute(interaction);
});

/* -------------------------------------------------------------
   4️⃣ Login
------------------------------------------------------------- */
client.login(process.env.DISCORD_TOKEN);
