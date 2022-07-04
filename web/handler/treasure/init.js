const express = require('express');
const qs = require('qs');
const axios = require('axios');
const Session = require('../../../schema/Session');
const logger = require('../../../provider/loggerProvider');
const { decrypt } = require('../../../util/aesEncrypto');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let { location } = req.query;
    const { accessToken, refreshToken } = req.cookies;

    location = decrypt(location);
    if (!location) throw new Error('잘못된 QR코드입니다.');

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

      const { sessionKey } = await new Session({ discordId: data.user.id, location }).save();

      setTimeout(async () => {
        if (await Session.findOne({ sessionKey })) {
          await Session.deleteOne({ sessionKey });
        }
      }, 1000 * 60 * 3);

      res
        .status(301)
        .redirect(
          `${process.env.WEB_DOMAIN}/treasure/give?sessionKey=${encodeURIComponent(sessionKey)}`,
        );
    }
  } catch (e) {
    logger.error(e.stack);

    res.render('staticPage', {
      title: '오류',
      subTitle: e.message,
    });
  }
});

module.exports = router;
