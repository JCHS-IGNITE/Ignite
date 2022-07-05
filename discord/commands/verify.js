const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

const User = require('../../schema/User');
const logger = require('../../provider/loggerProvider');
const sendMessage = require('../../util/sendMessage');

module.exports = {
  async execute(interaction) {
    const command = interaction.options.getSubcommand();

    const existUserByDiscordId = await User.findOne({ discordId: interaction.user.id });

    await interaction.reply({ content: '> 명령을 수행중입니다.', ephemeral: true });
    if (existUserByDiscordId) {
      if (existUserByDiscordId.verify) await interaction.editReply('> 이미 인증된 계정입니다.');
      else await interaction.editReply('> 이미 인증 대기중인 계정입니다.');
    } else {
      if (command === '일반계정' || command === '통합계정') {
        await interaction.editReply('> 인증을 진행중입니다...');

        const riroId =
          command === '통합계정'
            ? interaction.options.getString('아이디')
            : `22-${interaction.options.getInteger('학년')}${String(
                interaction.options.getInteger('반'),
              ).padStart(2, '0')}${String(interaction.options.getInteger('번호')).padStart(
                2,
                '0',
              )}`;
        const riroPw = interaction.options.getString('비밀번호');

        const params = new FormData();
        params.append('app', 'user');
        params.append('mode', 'login');
        params.append('userType', '1');
        params.append('id', riroId);
        params.append('pw', riroPw);
        params.append('is_start', 'false');

        const loginResult = await axios.post('https://jecheonh.riroschool.kr/ajax.php', params, {
          headers: { ...params.getHeaders() },
        });

        if (loginResult.data.result === 'fail') {
          if (loginResult.data.msg.includes('아이디가 없거나 비밀번호가 맞지 않습니다')) {
            const count = command === '일반계정' ? loginResult.data.msg.split('(')[1] : null;
            await interaction.editReply(
              `> 잘못된 아이디 또는 비밀번호입니다. ${count !== null ? `(${count}` : ''}`,
            );
          } else if (loginResult.data.msg.includes('통합 아이디(이메일)로 로그인하세요.')) {
            await interaction.editReply(
              '> 통합 계정입니다.\n> `/인증 자동 통합계정` 명령어를 통해 인증해주세요.',
            );
            logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (통합 아이디).', interaction.user.tag);
          } else {
            await interaction.editReply(`> 인증에 실패했습니다. ${loginResult.data.msg}`);
            logger.warn(
              '유저(%s)가 리로스쿨 인증에 실패함 (%s).',
              interaction.user.tag,
              loginResult.data.msg,
            );
          }
        } else if (loginResult.data.msg.includes('로그인을 연속 5회 실패했습니다.')) {
          await interaction.editReply('> 인증에 실패했습니다. 5분 후 다시 시도해주세요.');
          logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (최대 한도 초과).', interaction.user.tag);
        } else {
          if (
            loginResult.headers['set-cookie']
              .map((str) => ({
                key: str.split('=')[0],
                value: str.split('=')[1].split(';')[0],
              }))
              .filter((o) => o.key === 'login_chk' || o.key === 'cookie_token').length === 2
          ) {
            const infoResult = await axios.get('https://jecheonh.riroschool.kr/my_page.php', {
              headers: {
                Cookie: loginResult.headers['set-cookie'],
              },
            });

            const stdInfo = cheerio
              .load(infoResult.data)('#productos > div > div.m-card-tit > div:nth-child(2)')
              .text();

            const nbsp = ' ';

            const name = stdInfo.split(nbsp)[0];
            const grade = parseInt(stdInfo.split(nbsp)[1].substring(0, 1), 10);
            const clazz = parseInt(stdInfo.split(nbsp)[1].substring(1, 3), 10);
            const stdId = parseInt(stdInfo.split(nbsp)[1].substring(3, 5), 10);

            const existUserByStdInfo = await User.findOne({ grade, class: clazz, stdId });

            if (existUserByStdInfo) {
              if (existUserByStdInfo.verify)
                await interaction.editReply(
                  `> 이미 해당 학번으로 인증된 계정이 존재합니다. <@${existUserByStdInfo.discordId}>`,
                );
              else
                await interaction.editReply(
                  `> 이미 해당 학번으로 인증을 기다리는 계정이 존재합니다. <@${existUserByStdInfo.discordId}>`,
                );
            } else {
              await new User({
                name,
                grade,
                class: clazz,
                stdId,
                discordId: interaction.user.id,
                verify: true,
              }).save();

              await interaction.member.roles.add(process.env.DISCORD_VERIFY_ROLE);

              await interaction.editReply('> 인증에 성공했습니다.');

              await sendMessage.discord.successVerifyInDM(
                interaction.user,
                grade,
                clazz,
                stdId,
                name,
              );

              await sendMessage.discord.successVerifyInWelcomeChannel(
                interaction,
                name,
                grade,
                clazz,
                stdId,
              );

              logger.info('리로스쿨 인증을 통해 유저(%s)가 인증됨.', interaction.user.tag);
            }
          } else {
            await interaction.editReply(`> 리로스쿨 서버에서 토큰을 발급할 수 없습니다.`);
            logger.warn(
              '유저(%s)가 리로스쿨 인증에 실패함 (리로스쿨 토큰 발급 실패).',
              interaction.user.tag,
            );
          }
        }
      } else if (command === '수동') {
        const name = interaction.options.getString('이름');
        const grade = interaction.options.getInteger('학년');
        const clazz = interaction.options.getInteger('반');
        const stdId = interaction.options.getInteger('번호');
        const idCard = interaction.options.getAttachment('학생증');

        if (!idCard.contentType.startsWith('image/')) {
          await interaction.editReply('> 학생증 사진을 업로드해주세요.');
        } else {
          await new User({
            name,
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
                .addField('이름', name)
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
    .addSubcommandGroup((commandGroup) =>
      commandGroup
        .setName('자동')
        .setDescription('리로스쿨을 통해 자동으로 인증합니다.')
        .addSubcommand((command) =>
          command
            .setName('일반계정')
            .setDescription('일반적인 경우 이 옵션을 선택하세요.')
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
            .setName('통합계정')
            .setDescription('통합 계정(이메일)을 사용하여 인증합니다.')
            .addStringOption((option) =>
              option.setName('아이디').setDescription('리로스쿨 아이디').setRequired(true),
            )
            .addStringOption((option) =>
              option.setName('비밀번호').setDescription('리로스쿨 비밀번호').setRequired(true),
            ),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName('수동')
        .setDescription('관리자가 확인 후 승인합니다.')
        .addStringOption((option) =>
          option.setName('이름').setDescription('본명').setRequired(true),
        )
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
