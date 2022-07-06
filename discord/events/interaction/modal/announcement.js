const { MessageEmbed } = require('discord.js');
const TempFileStorage = require('../../../../schema/TempFileStorage');

module.exports = async (client, interaction) => {
  if (interaction.customId.startsWith('announcement')) {
    const title = interaction.fields.getTextInputValue('title');
    const content = interaction.fields.getTextInputValue('content');

    const channel = await interaction.guild.channels.fetch(
      process.env.DISCORD_ANNOUNCEMENT_CHANNEL,
    );

    await channel.send({
      embeds: [new MessageEmbed().setTitle(title).setDescription(content).setColor(0x66ccff)],
    });

    const files = [];
    if (interaction.customId.includes('$')) {
      const uuid = interaction.customId.split('$')[1].substring(0, 36);
      for (let i = 1; i <= 5; i += 1) {
        const file = await TempFileStorage.findOne({ uuid: `${uuid}-${i}` });
        if (file !== null) {
          files.push(file.url);
          await TempFileStorage.deleteOne({ uuid: `${uuid}-${i}` });
        }
      }
      await channel.send({ files });
    }

    await interaction.reply('> 공지를 전송했습니다.');
  }
};
