module.exports = {
  name: "interactionCreate",
  async execute(interaction) {

    // BUTTON HANDLER
    if (interaction.isButton()) {
      const selected = interaction.customId.replace("quiz_", "");

      if (selected === "Paris") {
        return interaction.update({
          content: `🎉 **Correct!**  
You selected **${selected}**, and that is the right answer!`,
          components: []
        });
      } else {
        return interaction.update({
          content: `❌ **Wrong Answer:** ${selected}  
The correct answer was **Paris**.`,
          components: []
        });
      }
    }

    // COMMAND HANDLER
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
    }
  }
};
