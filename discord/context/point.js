const { Modal, MessageActionRow, TextInputComponent, MessageEmbed } = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType, PermissionFlagsBits } = require('discord-api-types/v10');
const User = require('../../schema/User');

module.exports = {
  async execute(interaction) {
    const discordUser = interaction.targetUser;
    const discordId = discordUser.id;

    const user = await User.findOne({ discordId });

    if (user) {
      if (user.verify) {
        const modal = new Modal()
          .setCustomId(`point-${discordId}`)
          .setTitle(`포인트 수정 - ${user.name}`)
          .addComponents(
            new MessageActionRow().addComponents(
              new TextInputComponent()
                .setCustomId('point')
                .setLabel('포인트 증감량')
                .setPlaceholder(`현재 포인트: ${user.point}`)
                .setStyle('SHORT')
                .setRequired(true),
            ),
          );

        await interaction.showModal(modal);
      } else
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(`아직 인증 대기중인 유저입니다.`)
              .setColor(0xff5252)
              .setTimestamp(new Date()),
          ],
        });
    } else
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription(`서버에 등록된 유저가 아닙니다.`)
            .setColor(0xff5252)
            .setTimestamp(new Date()),
        ],
      });
  },
  data: new ContextMenuCommandBuilder()
    .setName('포인트 수정')
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
};
