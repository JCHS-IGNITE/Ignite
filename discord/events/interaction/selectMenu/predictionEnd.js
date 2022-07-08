const { MessageEmbed } = require('discord.js');
const Match = require('../../../../schema/Match');
const Team = require('../../../../schema/Team');
const User = require('../../../../schema/User');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'prediction_end') {
    const [matchId] = interaction.values;

    const user = await User.findOne({ discordId: interaction.user.id });

    const match = await Match.findById(matchId);

    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

    const members = (await interaction.guild.members.fetch()).filter((member) => {
      const roles = member.roles.cache;
      let find = false;
      roles.forEach((v) => {
        if (v.id === process.env.DISCORD_PREDICTION_PARTICIPATE_ROLE) find = true;
      });
      return find;
    });

    await Match.findByIdAndUpdate(matchId, { predictionEnd: new Date() });

    members.forEach((member) => {
      let selectedTeam;

      const t1 = match.predictionTeam1.filter((oid) => oid.equals(user._id)).length > 0;
      const t2 = match.predictionTeam2.filter((oid) => oid.equals(user._id)).length > 0;

      if (t1) selectedTeam = team1;
      else if (t2) selectedTeam = team2;
      else selectedTeam = null;

      member.send({
        embeds: [
          new MessageEmbed()
            .setTitle('승부예측 마감')
            .setDescription(
              `승부 예측이 마감되었습니다.\n\n[${team1.grade}-${team1.class}] ${team1.name} vs [${team2.grade}-${team2.class}] ${team2.name}`,
            )
            .addField(
              '내가 선택한 팀',
              selectedTeam !== null
                ? `[${selectedTeam.grade}-${selectedTeam.class}] ${selectedTeam.name}`
                : '승부예측을 하지 않았습니다.',
            )
            .setColor(0xff8d74),
        ],
      });
    });

    await interaction.reply({
      ephemeral: true,
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
