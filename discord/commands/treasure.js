const { MessageEmbed, MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const qrcode = require('qrcode');
const Treasure = require('../../schema/Treasure');
const logger = require('../../provider/loggerProvider');
const { encrypt } = require('../../util/aesEncrypto');

module.exports = {
  async execute(interaction) {
    const command = interaction.options.getSubcommand();

    await interaction.reply('> 명령을 수행중입니다.');

    if (command === '목록') {
      const treasures = await Treasure.find({});

      await interaction.editReply({
        content: ' ',
        embeds: [
          new MessageEmbed()
            .setTitle('보물 목록')
            .setDescription('모든 보물 목록입니다.')
            .addFields(
              treasures.map((treasure) => ({
                name: treasure.name,
                value: `${treasure.price}원 | ${treasure.code}`,
                inline: true,
              })),
            )
            .setColor(0xffff99)
            .setTimestamp(new Date()),
        ],
      });
    } else if (command === '생성') {
      const name = interaction.options.getString('이름');
      const price = interaction.options.getInteger('보상');

      if (await Treasure.findOne({ name }))
        await interaction.editReply('> 이미 존재하는 보물입니다.');
      else {
        const treasure = await new Treasure({
          name,
          price: price || 100,
        }).save();

        const qr = (
          await qrcode.toDataURL(
            `${process.env.WEB_DOMAIN}/verify?location=${encrypt(treasure.code)}`,
          )
        )
          .toString()
          .split(',')[1];

        logger.info(
          '관리자(%s)가 새 보물(%s, %s)을 생성했습니다.',
          interaction.user.tag,
          treasure.name,
          treasure.code,
        );

        await interaction.editReply({
          content: ' ',
          embeds: [
            new MessageEmbed()
              .setTitle('보물 생성')
              .setDescription('성공적으로 보물을 생성했습니다.')
              .addField('이름', treasure.name, true)
              .addField('코드', treasure.code, true)
              .addField('보상', treasure.price.toString(), true)
              .setColor(0x7bff7b)
              .setTimestamp(new Date()),
          ],
          files: [
            new MessageAttachment(null)
              .setName(treasure.name)
              .setDescription(`${treasure.name}(${treasure.code})`)
              .setFile(Buffer.from(qr, 'base64')),
          ],
        });
      }
    } else if (command === '삭제') {
      const code = interaction.options.getString('코드');

      const treasure = await Treasure.findOne({ code });

      if (!treasure) await interaction.editReply('> 존재하지 않는 보물입니다.');
      else {
        await Treasure.deleteOne({ code });

        logger.warn('관리자(%s)가 보물(%s)을 삭제했습니다.', interaction.user.tag, treasure.name);

        await interaction.editReply(`> 보물(${treasure.name})을 삭제했습니다.`);
      }
    }
  },
  data: new SlashCommandBuilder()
    .setName('보물')
    .setDescription('[관리자] 보물을 관리합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((command) => command.setName('목록').setDescription('모든 보물을 확인합니다.'))
    .addSubcommand((command) =>
      command
        .setName('생성')
        .setDescription('새 보물을 만듭니다.')
        .addStringOption((option) =>
          option.setName('이름').setDescription('보물 이름').setRequired(true),
        )
        .addIntegerOption((option) =>
          option.setName('보상').setDescription('보물 발견시 지급할 포인트').setRequired(false),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName('삭제')
        .setDescription('보물을 삭제합니다.')
        .addStringOption((option) =>
          option
            .setName('코드')
            .setDescription('삭제할 보물 코드를 입력해주세요.')
            .setRequired(true),
        ),
    ),
};
