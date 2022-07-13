const { MessageEmbed } = require('discord.js');
const Match = require('../../../../schema/Match');
const Team = require('../../../../schema/Team');
const User = require('../../../../schema/User');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'prediction_end') {
    const [matchId] = interaction.values;

    const match = await Match.findById(matchId);

    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

    await Match.findByIdAndUpdate(matchId, { predictionEnd: new Date() });

    // eslint-disable-next-line no-restricted-syntax
    for (const user of await Promise.all(match.predictionTeam1.map((oid) => User.findById(oid)))) {
      (await interaction.guild.members.fetch(user.discordId)).send({
        embeds: [
          new MessageEmbed()
            .setTitle('승부예측 마감')
            .setDescription(
              `승부 예측이 마감되었습니다.\n\n[${team1.grade}-${team1.class}] ${team1.name} vs [${team2.grade}-${team2.class}] ${team2.name}`,
            )
            .addField('내가 선택한 팀', `[${team1.grade}-${team1.class}] ${team1.name}`)
            .setColor(0xff8d74),
        ],
      });
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const user of await Promise.all(match.predictionTeam2.map((oid) => User.findById(oid)))) {
      (await interaction.guild.members.fetch(user.discordId)).send({
        embeds: [
          new MessageEmbed()
            .setTitle('승부예측 마감')
            .setDescription(
              `승부 예측이 마감되었습니다.\n\n[${team1.grade}-${team1.class}] ${team1.name} vs [${team2.grade}-${team2.class}] ${team2.name}`,
            )
            .addField('내가 선택한 팀', `[${team2.grade}-${team2.class}] ${team2.name}`)
            .setColor(0xff8d74),
        ],
      });
    }

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle('승부예측을 마감했습니다.')
          .setDescription(
            `[${team1.grade}-${team1.class}] ${team1.name} vs [${team2.grade}-${team2.class}] ${team2.name}`,
          )
          .setColor(0x7bff7b),
      ],
    });

    await interaction.message.delete();
  }
};
