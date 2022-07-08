const { MessageEmbed } = require('discord.js');

module.exports = async (client, interaction) => {
  if (interaction.customId.endsWith('prediction_role')) {
    const isAdd = interaction.customId.startsWith('add');

    const roleManager = interaction.member.roles;
    const role = await interaction.guild.roles.fetch(
      process.env.DISCORD_PREDICTION_PARTICIPATE_ROLE,
    );

    if (isAdd) {
      await roleManager.add(role);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('역할 추가')
            .setDescription(
              `<@&${process.env.DISCORD_PREDICTION_PARTICIPATE_ROLE}> 역할을 받았습니다.`,
            )
            .setColor(0x7bff7b),
        ],
      });
    } else {
      await roleManager.remove(role);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('역할 제거')
            .setDescription(
              `<@&${process.env.DISCORD_PREDICTION_PARTICIPATE_ROLE}> 역할을 삭제했습니다.`,
            )
            .setColor(0xff8d74),
        ],
      });
    }
  }
};
