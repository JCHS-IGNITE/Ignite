const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Match = require('../../../../schema/Match');
const Team = require('../../../../schema/Team');
const User = require('../../../../schema/User');

module.exports = async (client, interaction) => {
  if (interaction.customId.startsWith('prediction_start')) {
    const matchId = interaction.customId.substring(17);

    const match = await Match.findById(matchId);

    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

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

    const members = (await interaction.guild.members.fetch()).filter((member) => {
      const roles = member.roles.cache;
      let find = false;
      roles.forEach((v) => {
        if (v.id === process.env.DISCORD_PREDICTION_PARTICIPATE_ROLE) find = true;
      });
      return find;
    });

    const embed = new MessageEmbed()
      .setTitle('승부예측')
      .setDescription('이길 것 같은 팀을 골라주세요.')
      .addField(`[${team1.grade}-${team1.class}] ${team1.name}`, team1Members.join('\n'))
      .addField(`[${team2.grade}-${team2.class}] ${team2.name}`, team2Members.join('\n'))
      .addField('경기 UUID', matchId)
      .setColor(0x7bff7b);

    const component = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`prediction_survey-team1-${matchId}`)
        .setLabel(`[${team1.grade}-${team1.class}] ${team1.name}`)
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(`prediction_survey-team2-${matchId}`)
        .setLabel(`[${team2.grade}-${team2.class}] ${team2.name}`)
        .setStyle('SUCCESS'),
    );

    members.forEach((member) => {
      member.send({ embeds: [embed], components: [component] });
    });

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setTitle('승부예측 시작')
          .setDescription(
            `승부예측을 시작했습니다.\n총 ${members.size}명에게 승부예측 메시지를 전송했습니다.`,
          )
          .addField(`[${team1.grade}-${team1.class}] ${team1.name}`, team1Members.join('\n'))
          .addField(`[${team2.grade}-${team2.class}] ${team2.name}`, team2Members.join('\n'))
          .setColor(0x7bff7b),
      ],
    });

    await interaction.message.delete();
  }
};
