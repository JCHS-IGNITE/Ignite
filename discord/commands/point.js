const { Modal, TextInputComponent, MessageActionRow } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');

module.exports = {
  async execute(interaction) {
    const modal = new Modal()
      .setCustomId('announcement')
      .setTitle('공지 작성')
      .addComponents(
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId('title')
            .setLabel('제목')
            .setPlaceholder('제목을 작성해주세요.')
            .setStyle('SHORT')
            .setRequired(true),
        ),
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId('content')
            .setLabel('내용')
            .setPlaceholder('내용을 작성해주세요.')
            .setStyle('PARAGRAPH')
            .setRequired(true),
        ),
      );

    await interaction.showModal(modal);
  },
  data: new SlashCommandBuilder()
    .setName('공지')
    .setDescription('[관리자] 공지 사항에 글을 작성합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
};
