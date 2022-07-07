const { MessageEmbed } = require('discord.js');
const User = require('../../../../schema/User');
const Team = require('../../../../schema/Team');

module.exports = async (client, interaction) => {
  if (interaction.customId.startsWith('prediction')) {
    const teamNum = parseInt(interaction.customId.charAt(15), 10);

    const [selectedTeam] = interaction.values;
    const team = await Team.findById(selectedTeam);

    const [embed] = interaction.message.embeds;

    const { components } = interaction.message;

    embed.fields[teamNum - 1].name = `[${team.grade}-${team.class}] ${team.name}`;
    embed.fields[teamNum - 1].value = (
      await Promise.all(
        [
          team.member1,
          team.member2,
          team.member3,
          team.member4,
          team.member5,
          team.spareMember,
        ].map((id) => User.findById(id)),
      )
    )
      .map((o) => `<@${o.discordId}>`)
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
};
