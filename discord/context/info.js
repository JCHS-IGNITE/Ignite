const { MessageEmbed } = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v10');
const Team = require('../../schema/Team');
const User = require('../../schema/User');
const fetchRiot = require('../../util/fetchRiot');
const { pointToRank } = require('../../util/rank');

module.exports = {
  async execute(interaction) {
    const discordUser = interaction.targetUser;
    const discordId = discordUser.id;

    const user = await User.findOne({ discordId });

    if (user) {
      if (user.verify) {
        const embed = new MessageEmbed()
          .setTitle('정보')
          .setAuthor({
            name: discordUser.tag,
            iconURL: discordUser.avatarURL(),
          })
          .addField(
            '교내 정보',
            `학번: ${user.grade}${user.class}${user.stdId.toString().padStart(2, '0')}\n이름: ${
              user.name
            }`,
            true,
          )
          .addField(
            '포인트',
            `등급: ${await pointToRank(user)}\n포인트: ${user.point.toLocaleString()}`,
            true,
          )
          .setColor(0x66ccff);

        if (user.riotNickname) {
          const { nickname, level, rank } = await fetchRiot(user.riotNickname);
          embed.addField('라이엇', `닉네임: ${nickname}\n레벨: ${level}\n티어: ${rank.name}`);
        }

        const team = await Team.findOne({
          $or: [
            { member1: user._id },
            { member2: user._id },
            { member3: user._id },
            { member4: user._id },
            { member5: user._id },
            { spareMember: user._id },
          ],
        });

        if (team) embed.addField('E-Sport 팀', `[${team.grade}-${team.class}] ${team.name}`);

        await interaction.reply({
          ephemeral: true,
          embeds: [embed],
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
