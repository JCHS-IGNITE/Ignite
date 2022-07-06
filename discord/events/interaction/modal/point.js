const { MessageEmbed } = require('discord.js');
const User = require('../../../../schema/User');

module.exports = async (client, interaction) => {
  if (interaction.customId.startsWith('point')) {
    const point = interaction.fields.getTextInputValue('point');

    try {
      parseInt(point, 10);

      const discordId = interaction.customId.split('-')[1];

      await User.updateOne({ discordId }, { $inc: { point } });
      const user = await User.findOne({ discordId });

      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('포인트 지급')
            .setDescription(`포인트를 지급했습니다.`)
            .addField('대상 유저', `<@${discordId}>`, true)
            .addField('증감량', point.toString(), true)
            .addField('보유 포인트', user.point.toString(), true)
            .setColor(0x7bff7b)
            .setTimestamp(new Date()),
        ],
      });
    } catch (e) {
      console.error(e);

      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription('포인트는 정수로 입력해주세요.')
            .setColor(0xff5252)
            .setTimestamp(new Date()),
        ],
      });
    }
  }
};
