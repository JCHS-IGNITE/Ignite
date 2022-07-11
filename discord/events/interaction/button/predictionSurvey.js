const { MessageEmbed } = require('discord.js');
const Match = require('../../../../schema/Match');
const Team = require('../../../../schema/Team');
const User = require('../../../../schema/User');

module.exports = async (client, interaction) => {
  if (interaction.customId.startsWith('prediction_survey')) {
    const matchId = interaction.customId.substring(24);
    const match = await Match.findById(matchId);

    if (!match.predictionEnd) {
      const team1 = await Team.findById(match.team1);
      const team2 = await Team.findById(match.team2);

      const team = parseInt(interaction.customId.charAt(22), 10);

      const user = await User.findOne({ discordId: interaction.user.id });

      await Match.findByIdAndUpdate(matchId, {
        $pull: { predictionTeam1: user._id, predictionTeam2: user._id },
      });

      if (team === 1)
        await Match.findByIdAndUpdate(matchId, { $push: { predictionTeam1: user._id } });
      else await Match.findByIdAndUpdate(matchId, { $push: { predictionTeam2: user._id } });

      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('승부예측 제출')
            .setDescription(`정상적으로 제출했습니다.`)
            .addField(
              '내가 선택한 팀',
              team === 1
                ? `[${team1.grade}-${team1.class}] ${team1.name}`
                : `[${team2.grade}-${team2.class}] ${team2.name}`,
            )
            .setColor(0x7bff7b),
        ],
      });
    } else {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription('이미 마감됐습니다.')
            .setColor(0xff5252),
        ],
      });
    }
  }
};
