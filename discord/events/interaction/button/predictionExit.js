const { MessageEmbed } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'prediction_exit') {
    await interaction.message.delete();
    await interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed().setTitle('취소').setDescription(`취소되었습니다.`).setColor(0xffcc99),
      ],
    });
  }
};
