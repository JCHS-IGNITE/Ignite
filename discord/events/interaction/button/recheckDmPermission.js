const { MessageEmbed } = require('discord.js');
const User = require('../../../../schema/User');
const logger = require('../../../../provider/loggerProvider');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'recheck_dm_permission') {
    const { member } = interaction;

    try {
      (await member.send('Check permission...')).delete();

      await interaction.message.delete();

      const result = await User.findOne({ discordId: member.id });

      if (result) {
        await member.roles.add(process.env.DISCORD_VERIFY_ROLE);

        await member.send({
          embeds: [
            new MessageEmbed()
              .setTitle('역할 복구 완료')
              .setDescription(
                `${result.grade}학년 ${result.class}반 ${result.stdId}번 으로 인증되었습니다.`,
              )
              .addField('인증 방법', '기존 유저')
              .setColor(0x7bff7b)
              .setTimestamp(new Date()),
          ],
        });

        await logger.info('기존 유저(%s)에게 인증 권한을 지급했습니다.', member.user.tag);
      }
    } catch (e) {
      await interaction.reply({
        content: '위 과정을 수행 후 버튼을 눌러주세요.',
        ephemeral: true,
      });
    }
  }
};
