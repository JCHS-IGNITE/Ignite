const { MessageEmbed } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'announcement') {
    const title = interaction.fields.getTextInputValue('title');
    const content = interaction.fields.getTextInputValue('content');

    await (
      await interaction.guild.channels.fetch(process.env.DISCORD_ANNOUNCEMENT_CHANNEL)
    ).send({
      embeds: [
        new MessageEmbed()
          .setTitle(title)
          .setDescription(content)
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL(),
          })
          .setColor(0x66ccff),
      ],
    });

    await interaction.reply('> 공지를 전송했습니다.');
  }
};
