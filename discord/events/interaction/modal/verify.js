const FormData = require('form-data');
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../../../provider/loggerProvider');
const User = require('../../../../schema/User');
const sendMessage = require('../../../../util/sendMessage');

module.exports = async (client, interaction) => {
  if (interaction.customId === 'verify_riroschool') {
    await interaction.reply({ content: '> 명령을 수행중입니다.', ephemeral: true });

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

    if (loginResult.data.result === 'fail') {
      if (loginResult.data.msg.includes('아이디가 없거나 비밀번호가 맞지 않습니다')) {
        await interaction.editReply(`> 잘못된 아이디 또는 비밀번호입니다.`);
        logger.warn('유저(%s)가 리로스쿨 인증에 실패함 (계정 정보 틀림).', interaction.user.tag);
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
      await interaction.editReply('> 5번 연속으로 인증에 실패했습니다. 5분 후 다시 시도해주세요.');
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
          await interaction.member.setNickname(name);

          await interaction.editReply('> 인증에 성공했습니다.');

          await sendMessage.discord.successVerifyInDM(interaction.user, grade, clazz, stdId, name);
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
  }
};
