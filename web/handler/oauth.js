const express = require('express');
const qs = require('qs');
const axios = require('axios');
const logger = require('../../provider/loggerProvider');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { code } = req.query;
    const { lastUrl } = req.cookies;

    const params = qs.stringify({
      client_id: process.env.DISCORD_BOT_CLIENT_ID,
      client_secret: process.env.DISCORD_BOT_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
    });

    const result = (await axios.post('https://discord.com/api/v10/oauth2/token', params)).data;

    const cookieOption = {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };

    res.cookie('accessToken', result.access_token, cookieOption);
    res.cookie('refreshToken', result.refresh_token, cookieOption);

    const { data } = await axios('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${result.access_token}` },
    });

    if (lastUrl) {
      res.clearCookie('lastUrl');
      res.status(301).redirect(process.env.WEB_DOMAIN + lastUrl);
    } else
      res.render('staticPage', {
        title: '로그인 성공!',
        subTitle: `${data.username}#${data.discriminator} : QR을 다시 찍어주세요.`,
      });
  } catch (e) {
    logger.error(e);

    res.render('staticPage', {
      title: '오류',
      subTitle: e.message,
    });
  }
});

module.exports = router;
