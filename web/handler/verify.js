const express = require('express');
const qs = require('qs');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const User = require('../../schema/User');
const Treasure = require('../../schema/Treasure');
const { decrypt } = require('../../util/aesEncrypto');
const discordBot = require('../../discord/bot');
const logger = require('../../provider/loggerProvider');

const router = express.Router();

const client = discordBot();

router.get('/', async (req, res) => {
  try {
    const { location } = req.query;
    let { accessToken, refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
      const params = {
        response_type: 'code',
        scope: 'identify',
        client_id: process.env.DISCORD_BOT_CLIENT_ID,
        redirect_url: encodeURIComponent(`${process.env.WEB_DOMAIN}/oauth`),
      };

      res.cookie('lastUrl', req.originalUrl);

      res.status(301).redirect(`https://discord.com/api/oauth2/authorize?${qs.stringify(params)}`);
    } else {
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

        const { data } = await axios.post('https://discord.com/api/v10/oauth2/token', params);

        const cookieOption = {
          maxAge: 1000 * 60 * 60 * 24 * 7,
        };

        accessToken = data.access_token;
        refreshToken = data.refresh_token;

        res.cookie('accessToken', accessToken, cookieOption);
        res.cookie('refreshToken', refreshToken, cookieOption);
      }

      const { data } = await axios('https://discord.com/api/oauth2/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      let user = await User.findOne({ discordId: data.user.id });

      if (user) {
        const treasureCode = decrypt(location);

        const treasure = await Treasure.findOne({ code: treasureCode });

        if (!treasure) throw new Error('존재하지 않는 보물입니다.');

        if (user.treasures.includes(treasureCode)) throw new Error('이미 발견한 보물입니다.');

        await User.updateOne(
          { discordId: data.user.id },
          { $inc: { point: treasure.price }, $push: { treasures: treasure.code } },
        );

        user = await User.findOne({ discordId: data.user.id });

        await (
          await (
            await (await client).guilds.fetch(process.env.DISCORD_GUILD_ID)
          ).members.fetch(user.discordId)
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
