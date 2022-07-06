const { Modal, TextInputComponent, MessageActionRow } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionFlagsBits } = require('discord-api-types/v10');
const TempFileStorage = require('../../schema/TempFileStorage');
const getUuid = require('../../util/genUuid');

module.exports = {
  async execute(interaction) {
    const channel = interaction.options.getChannel('채널');

    const uuid = getUuid();

    let fIdx = 0;
    for (let i = 1; i <= 5; i += 1) {
      const file = interaction.options.getAttachment(`파일${i}`);

      if (file !== null)
        await new TempFileStorage({
          uuid: `${uuid}-${(fIdx += 1)}`,
          url: file.attachment,
        }).save();
    }

    const modal = new Modal()
      .setCustomId(`announcement|${channel.id}${fIdx > 0 ? `$${uuid}` : ''}`)
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
    .addChannelOption((option) =>
      option
        .setName('채널')
        .setDescription('공지를 전송할 채널을 선택해주세요.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addAttachmentOption((option) =>
      option.setName('파일1').setDescription('업로드할 파일이 있을 경우 선택해주세요.'),
    )
    .addAttachmentOption((option) =>
      option.setName('파일2').setDescription('업로드할 파일이 있을 경우 선택해주세요.'),
    )
    .addAttachmentOption((option) =>
      option.setName('파일3').setDescription('업로드할 파일이 있을 경우 선택해주세요.'),
    )
    .addAttachmentOption((option) =>
      option.setName('파일4').setDescription('업로드할 파일이 있을 경우 선택해주세요.'),
    )
    .addAttachmentOption((option) =>
      option.setName('파일5').setDescription('업로드할 파일이 있을 경우 선택해주세요.'),
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
};
