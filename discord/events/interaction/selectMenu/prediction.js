const { MessageEmbed } = require('discord.js');
const User = require('../../../../schema/User');
const Team = require('../../../../schema/Team');
const fetchRiot = require('../../../../util/fetchRiot');

module.exports = async (client, interaction) => {
  if (interaction.customId.startsWith('prediction')) {
    const teamNum = parseInt(interaction.customId.charAt(15), 10);

    const [selectedTeam] = interaction.values;
    const team = await Team.findById(selectedTeam);

    const [embed] = interaction.message.embeds;

    const { components } = interaction.message;

    const members = await Promise.all(
      [team.member1, team.member2, team.member3, team.member4, team.member5, team.spareMember].map(
        (id) => User.findById(id),
      ),
    );

    if (members.filter((o) => o === null).length > 0)
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed().setTitle('오류 발생').setDescription('팀이 꽉 차지 않았습니다.'),
        ],
      });
    else {
      const notLinkedMembers = members.filter((o) => o !== null).filter((o) => !o.riotNickname);

      if (notLinkedMembers.length > 0) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(
                `라이엇 연동을 하지 않은 유저가 있습니다.\n연동 후 다시 시도해주세요.\n\n연동되지 않은 유저:
              ${notLinkedMembers
                .map(
                  (o) => ` - ${o.grade}${o.class}${o.stdId.toString().padStart(2, '0')} ${o.name}`,
                )
                .join('\n')}`,
              )
              .setColor(0xff5252),
          ],
        });
      } else {
        embed.fields[teamNum - 1].name = `[${team.grade}-${team.class}] ${team.name}`;
        embed.fields[teamNum - 1].value = (
          await Promise.all(
            members.map(async (o) => ({
              discordId: o.discordId,
              riot: await fetchRiot(o.riotNickname),
            })),
          )
        )
          .map((o) => `<@${o.discordId}>  :  [${o.riot.rank.name}] ${o.riot.nickname}`)
          .join('\n');

        components[2].components[0].disabled =
          embed.fields[0].name === '[팀1]' || embed.fields[1].name === '[팀2]';

        await interaction.message.edit({ embeds: [embed], components });

        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle(`팀 등록 성공`)
              .setDescription(`${teamNum}팀(${team.name})을 등록했습니다.`)
              .setColor(0x7bff7b),
          ],
        });
      }
    }
  }
};
