const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const User = require('../../../../schema/User');
const Team = require('../../../../schema/Team');
const Match = require('../../../../schema/Match');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'prediction_start') {
    const [matchId] = interaction.values;

    const match = await Match.findById(matchId);

    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

    if (
      team1.member1 &&
      team1.member2 &&
      team1.member3 &&
      team1.member4 &&
      team1.member5 &&
      team1.spareMember &&
      team2.member1 &&
      team2.member2 &&
      team2.member3 &&
      team2.member4 &&
      team2.member5 &&
      team2.spareMember
    ) {
      const team1Users = await Promise.all(
        Object.entries(team1._doc)
          .filter((obj) => obj[0].includes('member'))
          .map((obj) => obj[1])
          .map((obj) => obj._id)
          .map((id) => User.findById(id)),
      );
      const team1Members = team1Users.map(
        (user) => `[${user.grade}-${user.class}] ${user.name} | ${user.riotNickname}`,
      );

      const team2Users = await Promise.all(
        Object.entries(team2._doc)
          .filter((obj) => obj[0].includes('member'))
          .map((obj) => obj[1])
          .map((obj) => obj._id)
          .map((id) => User.findById(id)),
      );
      const team2Members = team2Users.map(
        (user) => `[${user.grade}-${user.class}] ${user.name} | ${user.riotNickname}`,
      );

      await Match.findByIdAndUpdate(matchId, { predictionStart: new Date() });

      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('승부예측 등록')
            .addField(`[${team1.grade}-${team1.class}] ${team1.name}`, team1Members.join('\n'))
            .addField(`[${team2.grade}-${team2.class}] ${team2.name}`, team2Members.join('\n'))
            .setColor(0x7bff7b),
        ],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`prediction_start-${matchId}`)
              .setLabel('시작')
              .setStyle('SUCCESS'),
          ),
        ],
      });

      await interaction.message.delete();
    } else {
      const embed = new MessageEmbed()
        .setTitle('오류 발생')
        .setDescription('매칭 팀의 선수가 비어있습니다.')
        .setColor(0xff5252);

      const team1Empty = [];
      for (let i = 1; i <= 5; i += 1) if (!team1[`member${i}`]) team1Empty.push(`선수${i}`);
      if (!team1.spareMember) team1Empty.push('예비 선수');

      const team2Empty = [];
      for (let i = 1; i <= 5; i += 1) if (!team2[`member${i}`]) team2Empty.push(`선수${i}`);
      if (!team2.spareMember) team2.empty.push('예비 선수');

      if (team1Empty.length > 0)
        embed.addField(
          `[${team1.grade}-${team1.class}] ${team1.name}`,
          team1Empty.join('\n'),
          true,
        );

      if (team2Empty.length > 0)
        embed.addField(
          `[${team2.grade}-${team2.class}] ${team2.name}`,
          team2Empty.join('\n'),
          true,
        );

      await interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    }
  }
};
