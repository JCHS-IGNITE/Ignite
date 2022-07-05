const express = require('express');
const qs = require('qs');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const User = require('../../../schema/User');
const Treasure = require('../../../schema/Treasure');
const Session = require('../../../schema/Session');
const discordBot = require('../../../discord/bot');
const logger = require('../../../provider/loggerProvider');

const router = express.Router();

const client = discordBot();

router.get('/', async (req, res) => {
  try {
    const { sessionKey } = req.query;
    const { accessToken, refreshToken } = req.cookies;

    if (!sessionKey) throw new Error('잘못된 접근입니다.');

    const { discordId, location } = await Session.findOne({ sessionKey });

    if (!discordId || !location) throw new Error('잘못된 접근입니다.');

    if (!accessToken || !refreshToken) {
      const params = {
        response_type: 'code',
        scope: 'identify',
        client_id: process.env.DISCORD_BOT_CLIENT_ID,
      };

      res.cookie('lastUrl', req.originalUrl);

      res.status(301).redirect(`https://discord.com/api/oauth2/authorize?${qs.stringify(params)}`);
    } else {
      const cookieOption = {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      };

      try {
        await axios('https://discord.com/api/oauth2/@me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (ignored) {
        const params = qs.stringify({
          client_id: process.env.DISCORD_BOT_CLIENT_ID,
          client_secret: process.env.DISCORD_BOT_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        });

        const { refreshTokenResponse } = await axios.post(
          'https://discord.com/api/v10/oauth2/token',
          params,
        );

        res.cookie('accessToken', refreshTokenResponse.access_token, cookieOption);
        res.cookie('refreshToken', refreshTokenResponse.refresh_token, cookieOption);
      }

      const { data } = await axios('https://discord.com/api/oauth2/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (discordId !== data.user.id) throw new Error('유효한 세션이 아닙니다.');

      let user = await User.findOne({ discordId });

      if (!user) throw new Error('존재하지 않는 유저입니다.');
      if (!user.verify) throw new Error('인증되지 않은 유저입니다.');

      if (user) {
        const treasure = await Treasure.findOne({ code: location });

        if (!treasure) throw new Error('존재하지 않는 보물입니다.');

        if (user.treasures.includes(location)) throw new Error('이미 발견한 보물입니다.');

        await User.updateOne(
          { discordId },
          { $inc: { point: treasure.price }, $push: { treasures: treasure.code } },
        );

        user = await User.findOne({ discordId });

        await (
          await (
            await (await client).guilds.fetch(process.env.DISCORD_GUILD_ID)
          ).members.fetch(discordId)
        ).send({
          embeds: [
            new MessageEmbed()
              .setTitle('보물 찾기')
              .setDescription('보물을 찾았습니다.')
              .addField('이름', treasure.name, true)
              .addField('보상 (현재 포인트)', `${treasure.price} (${user.point})`, true)
              .addField(
                '찾은 보물 수 / 전체 보물 수',
                `${user.treasures.length} / ${await Treasure.count({})}`,
                false,
              )
              .setColor(0xff66ff)
              .setTimestamp(new Date()),
          ],
        });

        res.render('staticPage', {
          title: '성공',
          subTitle: '보물을 찾았습니다.',
        });
      } else {
        res.render('staticPage', {
          title: '오류',
          subTitle: '디스코드 서버에 등록된 유저가 아닙니다.',
        });
      }
    }
  } catch (e) {
    let { message } = e;

    if (e.code === 'ERR_INVALID_ARG_TYPE') message = '등록된 보물이 아닙니다.';

    logger.error(e.stack);

    res.render('staticPage', {
      title: '오류',
      subTitle: message,
    });
  }
});

module.exports = router;
