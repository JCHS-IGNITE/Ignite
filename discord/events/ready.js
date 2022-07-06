const { MessageEmbed } = require('discord.js');
const logger = require('../../provider/loggerProvider');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info('봇 로그인 성공.');
    logger.info(`  - ${client.user.tag}`);
    logger.info(`  - ${client.user.id}`);
    logger.info('');

    await client.user.setActivity({ name: '제천고등학교', type: 'COMPETING' });

    const verifyChannel = await client.channels.fetch(process.env.DISCORD_VERIFY_CHANNEL);

    if (
      (await verifyChannel.messages.fetch({ limit: 100 }))
        .filter((message) => message.author.id === process.env.DISCORD_BOT_CLIENT_ID)
        .filter((message) => message.embeds.length === 1)
        .filter((message) => message.embeds[0].title === '재학생 인증 방법').size === 0
    )
      await verifyChannel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('재학생 인증 방법')
            .setDescription(
              '제천고등학교 학생인지 인증을 해주세요.\n\n한 학번으로 디스코드 계정 하나만 인증 가능합니다.',
            )
            .addField(
              '자동 인증 ',
              '리로스쿨 계정을 통해 인증합니다.\n`/인증 자동 일반계정` 명령어를 사용해주세요.',
            )
            .addField(
              '수동 인증',
              '학생증 사진을 업로드 하여 관리자가 확인 후 인증합니다.\n`/인증 수동` 명령어를 사용해주세요.',
            )
            .setColor(0xffcc99),
        ],
      });
  },
};
