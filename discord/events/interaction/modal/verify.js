const FormData = require('form-data');
const axios = require('axios');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');
const logger = require('../../../../provider/loggerProvider');
const User = require('../../../../schema/User');
const sendMessage = require('../../../../util/sendMessage');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'verify_riroschool') {
    const riroId = interaction.fields.getTextInputValue('id');
    const riroPw = interaction.fields.getTextInputValue('pw');

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

    if (loginResult.data.result === 'fail' || loginResult.data.result === false) {
      if (loginResult.data.msg.includes('아이디가 없거나 비밀번호가 맞지 않습니다')) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription('잘못된 비밀번호입니다.')
              .setColor(0xff5252),
          ],
        });
        logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (계정 정보 틀림).', interaction.user.tag);
      } else if (loginResult.data.msg === '통합 아이디(이메일)로 로그인하세요.') {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(
                '리로스쿨 통합 계정입니다.\n`/인증 자동 통합계정` 명령어를 사용해주세요.',
              )
              .setColor(0xff5252),
          ],
        });
        logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (통합 아이디).', interaction.user.tag);
      } else {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(`인증에 실패했습니다.\n${loginResult.data.msg}`)
              .setColor(0xff5252),
          ],
        });
        logger.warn(
          '유저(%s)가 리로스쿨 인증에 실패함 (%s).',
          interaction.user.tag,
          loginResult.data.msg,
        );
      }
    } else if (loginResult.data.msg.includes('로그인을 연속 5회 실패했습니다.')) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription('5회 연속으로 인증에 실패했습니다.\n5분 후 다시 시도해주세요.')
            .setColor(0xff5252),
        ],
      });
      logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (최대 한도 초과).', interaction.user.tag);
    } else {
      try {
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
            await interaction.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setTitle('오류 발생')
                  .setDescription(
                    `해당 학번으로 인증된 계정이 이미 존재합니다.\n<@${existUserByStdInfo.discordId}>`,
                  )
                  .setColor(0xff5252),
              ],
            });
          else
            await interaction.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setTitle('오류 발생')
                  .setDescription(
                    `해당 학번으로 인증을 기다리는 계정이 이미 존재합니다.\n<@${existUserByStdInfo.discordId}>`,
                  )
                  .setColor(0xff5252),
              ],
            });
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
          try {
            await interaction.member.setNickname(
              `${grade}${clazz}${stdId.toString().padStart(2, '0')} ${name}`,
            );
            // eslint-disable-next-line no-empty
          } catch (e) {}

          await interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
                .setTitle('재학생 인증 성공')
                .setDescription('인증에 성공했습니다.')
                .setColor(0x7bff7b),
            ],
          });

          await sendMessage.discord.successVerifyInDM(interaction.user, grade, clazz, stdId, name);

          logger.info('리로스쿨 인증을 통해 유저(%s)가 인증됨.', interaction.user.tag);
        }
      } catch (e) {
        console.error(e);
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription('리로스쿨 토큰 발급에 실패했습니다.\n잠시 후 다시 시도해주세요.')
              .setColor(0xff5252),
          ],
        });
        logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (토큰 발급).', interaction.user.tag);
      }
    }
  }
};
