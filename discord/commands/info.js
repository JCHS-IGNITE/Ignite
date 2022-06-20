const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../schema/User');
const { pointToRank } = require('../../util/rank');

module.exports = {
  async execute(interaction) {
    const discordUser = interaction.options.getUser('유저') || interaction.user;
    const discordId = discordUser.id;

    await interaction.reply('> 명령을 수행중입니다.');

    const user = await User.findOne({ discordId });

    if (user)
      await interaction.editReply({
        content: ' ',
        embeds: [
          new MessageEmbed()
            .setTitle('정보')
            .setAuthor({
              name: discordUser.tag,
              iconURL: discordUser.avatarURL(),
            })
            .addField('학번', `${user.grade}${user.class}${user.stdId.toString().padStart(2, '0')}`)
            .addField('포인트', user.point.toLocaleString(), true)
            .addField('랭크', await pointToRank(user), true)
            .setColor(0x66ccff)
            .setTimestamp(new Date()),
        ],
      });
    else await interaction.editReply('서버에 등록된 유저가 아닙니다.');
  },
  data: new SlashCommandBuilder()
    .setName('정보')
    .setDescription('유저 정보를 조회합니다.')
    .addUserOption((option) =>
      option.setName('유저').setDescription('특정 유저의 정보를 조회합니다.').setRequired(false),
    ),
};
