const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const FormData = require('form-data');

const User = require('../../schema/User');
const logger = require('../../provider/loggerProvider');

module.exports = {
  async execute(interaction) {
    const command = interaction.options.getSubcommand();

    const grade = interaction.options.getInteger('학년');
    const clazz = interaction.options.getInteger('반');
    const stdId = interaction.options.getInteger('번호');

    const existUser = await User.findOne({ grade, class: clazz, stdId });

    await interaction.reply({ content: '> 명령을 수행중입니다.', ephemeral: true });

    if (existUser) {
      if (existUser.verify)
        await interaction.editReply(
          `> 이미 해당 학번으로 인증된 계정이 존재합니다. <@${existUser.discordId}>`,
        );
      else
        await interaction.editReply(
          `> 이미 해당 학번으로 인증을 기다리는 계정이 존재합니다. <@${existUser.discordId}>`,
        );
    } else if (await User.findOne({ discordId: interaction.user.id })) {
      await interaction.editReply('> 이미 인증된 계정입니다.');
    } else {
      if (command === '자동') {
        const riroId = `22-${grade}${String(clazz).padStart(2, '0')}${String(stdId).padStart(
          2,
          '0',
        )}`;
        const riroPw = interaction.options.getString('비밀번호');

        await interaction.editReply('> 인증을 진행중입니다...');

        const params = new FormData();
        params.append('app', 'user');
        params.append('mode', 'login');
        params.append('userType', '1');
        params.append('id', riroId);
        params.append('pw', riroPw);
        params.append('is_start', 'false');

        const { data } = await axios.post('https://jecheonh.riroschool.kr/ajax.php', params, {
          headers: { ...params.getHeaders() },
        });

        if (data.result === 'fail') {
          if (data.msg.includes('아이디가 없거나 비밀번호가 맞지 않습니다')) {
            await interaction.editReply(`> 잘못된 비밀번호입니다. (${data.msg.split('(')[1]}`);
            logger.warn(
              '유저(%s)가 리로스쿨 인증에 실패함 (비밀번호 틀림. %s).',
              interaction.user.tag,
              data.msg.split('(')[1],
            );
          } else if (data.msg.includes('통합 아이디(이메일)로 로그인하세요.')) {
            await interaction.editReply('> 인증이 불가능한 계정입니다. 수동으로 인증해주세요.');
            logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (통합 아이디).', interaction.user.tag);
          } else {
            await interaction.editReply(`> 인증에 실패했습니다. ${data.msg}`);
            logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (%s).', interaction.user.tag, data.msg);
          }
        } else if (data.msg.includes('로그인을 연속 5회 실패했습니다.')) {
          await interaction.editReply('> 인증에 실패했습니다. 5분 후 다시 시도해주세요.');
          logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (최대 한도 초과).', interaction.user.tag);
        } else {
          await new User({
            grade,
            class: clazz,
            stdId,
            discordId: interaction.user.id,
            verify: true,
          }).save();

          await interaction.member.roles.add(process.env.DISCORD_VERIFY_ROLE);

          await interaction.editReply('> 인증에 성공했습니다.');

          await interaction.user.send({
            embeds: [
              new MessageEmbed()
                .setTitle('재학생 인증 성공')
                .setDescription(`${grade}학년 ${clazz}반 ${stdId}번 으로 인증되었습니다.`)
                .addField('인증 방법', '리로스쿨 인증')
                .setColor(0x7bff7b)
                .setTimestamp(new Date()),
            ],
          });

          await (
            await interaction.client.channels.fetch(process.env.DISCORD_WELCOME_CHANNEL)
          ).send({
            embeds: [
              new MessageEmbed()
                .setTitle('재학생 인증 성공')
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL(),
                })
                .setDescription(`<@${interaction.user.id}>`)
                .setColor(0x7bff7b)
                .setTimestamp(new Date())
                .addField('학년', grade.toString(), true)
                .addField('반', clazz.toString(), true)
                .addField('번호', stdId.toString(), true),
            ],
          });

          logger.info('리로스쿨 인증을 통해 유저(%s)가 인증됨.', interaction.user.tag);
        }
      } else if (command === '수동') {
        const idCard = interaction.options.getAttachment('학생증');

        if (!idCard.contentType.startsWith('image/')) {
          await interaction.editReply('> 학생증 사진을 업로드해주세요.');
        } else {
          await new User({
            grade,
            class: clazz,
            stdId,
            discordId: interaction.user.id,
            verify: false,
          }).save();

          await interaction.editReply('> 관리자가 확인중입니다.');

          await interaction.user.send({
            embeds: [
              new MessageEmbed()
                .setTitle('인증 대기 중')
                .setDescription(`관리자가 확인 후 인증 여부가 결정됩니다.\n잠시만 기다려주세요.`)
                .setColor(0xffff99)
                .setTimestamp(new Date()),
            ],
          });

          await (
            await interaction.client.channels.fetch(process.env.DISCORD_ADMIN_VERIFY_CHANNEL)
          ).send({
            embeds: [
              new MessageEmbed()
                .setTitle('관리자 인증')
                .setDescription(`<@${interaction.user.id}>`)
                .setColor(0xffff99)
                .addField('학년', grade.toString(), true)
                .addField('반', clazz.toString(), true)
                .addField('번호', stdId.toString(), true)
                .addField('디스코드 이름', interaction.user.tag, true)
                .addField('디스코드 아이디', interaction.user.id, true)
                .setImage(idCard.attachment.toString())
                .setTimestamp(new Date()),
            ],
            components: [
              new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('manual_verify_approve')
                    .setLabel('승인')
                    .setStyle('SUCCESS'),
                )
                .addComponents(
                  new MessageButton()
                    .setCustomId('manual_verify_reject')
                    .setLabel('거부')
                    .setStyle('DANGER'),
                ),
            ],
          });

          logger.info('유저(%s)가 인증을 요청함.', interaction.user.tag);
        }
      }
    }
  },
  data: new SlashCommandBuilder()
    .setName('인증')
    .setDescription('제천고등학교 학생인지 인증합니다.')
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName('자동')
        .setDescription('리로스쿨로 인증합니다.')
        .addIntegerOption((option) =>
          option
            .setName('학년')
            .setDescription('교내 학년')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(3),
        )
        .addIntegerOption((option) =>
          option
            .setName('반')
            .setDescription('교내 반')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(8),
        )
        .addIntegerOption((option) =>
          option
            .setName('번호')
            .setDescription('교내 번호')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(30),
        )
        .addStringOption((option) =>
          option.setName('비밀번호').setDescription('리로스쿨 비밀번호').setRequired(true),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName('수동')
        .setDescription('관리자가 확인 후 승인합니다.')
        .addIntegerOption((option) =>
          option
            .setName('학년')
            .setDescription('교내 학년')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(3),
        )
        .addIntegerOption((option) =>
          option
            .setName('반')
            .setDescription('교내 반')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(8),
        )
        .addIntegerOption((option) =>
          option
            .setName('번호')
            .setDescription('교내 번호')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(30),
        )
        .addAttachmentOption((option) =>
          option.setName('학생증').setDescription('학생증').setRequired(true),
        ),
    ),
};
