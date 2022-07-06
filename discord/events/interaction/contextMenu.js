module.exports = async (client, interaction) => {
  if (interaction.isContextMenu()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      if (await interaction.fetchReply())
        await interaction.editReply('> 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      else await interaction.reply('> 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');

      throw error;
    }
  }
};
