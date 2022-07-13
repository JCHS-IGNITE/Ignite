const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const Team = require('../../../../schema/Team');
const Match = require('../../../../schema/Match');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'prediction_set1') {
    const [matchId] = interaction.values;

    const match = await Match.findById(matchId);

    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

    const options = [
      {
        label: `${team1.grade}-${team1.class}`,
        description: team1.name,
        value: 'team1',
      },
      {
        label: `${team2.grade}-${team2.class}`,
        description: team2.name,
        value: 'team2',
      },
    ];

    await interaction.reply({
      ephemeral: true,
      components: [
        new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId(`prediction_set2-${matchId}`)
            .setOptions(options)
            .setPlaceholder('승부를 입력할 매치를 선택해주세요.'),
        ),
      ],
    });

    await interaction.message.delete();
  }
};
