const { MessageEmbed } = require('discord.js');
const Team = require('../../../../schema/Team');
const Match = require('../../../../schema/Match');
const User = require('../../../../schema/User');

module.exports = async (client, interaction) => {
  if (interaction.customId.startsWith('prediction_set2')) {
    const matchId = interaction.customId.substring(16);

    const match = await Match.findById(matchId);

    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

    const [win] = interaction.values;

    await Match.findByIdAndUpdate(matchId, { win: win === 'team1' ? team1 : team2 });

    const winners = win === 'team1' ? match.predictionTeam1 : match.predictionTeam2;
    const defeats = win === 'team1' ? match.predictionTeam2 : match.predictionTeam1;

    // eslint-disable-next-line no-restricted-syntax
    for (const id of winners) {
      const user = await User.findByIdAndUpdate(id, { $inc: { point: 1 } });

      (await interaction.guild.members.fetch(user.discordId)).send({
        embeds: [
          new MessageEmbed()
            .setTitle('승부예측 성공')
            .setDescription(`승부예측에 성공했습니다.\n1포인트가 지급됩니다.`)
            .addField(
              '경기',
              `[${team1.grade}-${team1.class}] ${team1.name} vs [${team2.grade}-${team2.class}] ${team2.name}`,
            )
            .addField('보유 포인트', user.point.toString())
            .setColor(0x7bff7b),
        ],
      });
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setTitle('승부예측 결과 등록')
          .setDescription(
            `승부 결과를 등록했습니다.\n승부를 맞춘 ${winners.length}명에게 1포인트를 지급했습니다.`,
          )
          .addField(
            '경기',
            `[${team1.grade}-${team1.class}] ${team1.name} vs [${team2.grade}-${team2.class}] ${team2.name}`,
          )
          .addField('승리한 팀', win === 'team1' ? team1.name : team2.name)
          .addField('맞춘 사람', `${winners.length}명`, true)
          .addField('틀린 사람', `${defeats.length}명`, true)
          .setColor(0x7bff7b),
      ],
    });

    await interaction.message.delete();
  }
};
