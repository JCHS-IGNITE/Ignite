const { MessageEmbed } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      if (await interaction.fetchReply())
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(error.message)
              .setColor(0xff5252)
              .setTimestamp(new Date()),
          ],
        });
      else
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(error.message)
              .setColor(0xff5252)
              .setTimestamp(new Date()),
          ],
        });

      throw error;
    }
  }
};
