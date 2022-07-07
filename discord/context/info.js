const { MessageEmbed } = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v10');
const User = require('../../schema/User');
const { pointToRank } = require('../../util/rank');

module.exports = {
  async execute(interaction) {
    const discordUser = interaction.targetUser;
    const discordId = discordUser.id;

    const user = await User.findOne({ discordId });

    if (user) {
      if (user.verify) {
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle('정보')
              .setAuthor({
                name: discordUser.tag,
                iconURL: discordUser.avatarURL(),
              })
              .addField('이름', user.name)
              .addField(
                '학번',
                `${user.grade}${user.class}${user.stdId.toString().padStart(2, '0')}`,
              )
              .addField('포인트', user.point.toLocaleString(), true)
              .addField('랭크', await pointToRank(user), true)
              .setColor(0x66ccff),
          ],
        });
      } else
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(`아직 인증 대기중인 유저입니다.`)
              .setColor(0xff5252),
          ],
        });
    } else
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription(`서버에 등록된 유저가 아닙니다.`)
            .setColor(0xff5252),
        ],
      });
  },
  data: new ContextMenuCommandBuilder()
    .setName('정보 보기')
    .setType(ApplicationCommandType.User)
    .setDMPermission(false),
};
