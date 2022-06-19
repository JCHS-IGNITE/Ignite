module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      try {
        await interaction.reply({
          content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          ephemeral: true,
        });
      } catch (e) {
        await interaction.editReply('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      throw error;
    }
  }
};
