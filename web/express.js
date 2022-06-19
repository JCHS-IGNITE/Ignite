const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const logger = require('../provider/loggerProvider');
const log = require('./middleware/log');
const forceHttps = require('./middleware/forceHttps');
const pnf = require('./middleware/pnf');
const oauthHandler = require('./handler/oauth');
const verifyHandler = require('./handler/verify');

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/view`);

app.use(log);
app.use(forceHttps);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/static`));

app.use('/oauth', oauthHandler);
app.use('/verify', verifyHandler);

app.use(pnf);

module.exports = async () => {
  const cert = {
    ca: fs.readFileSync(`${__dirname}/cert/ca_bundle.crt`),
    key: fs.readFileSync(`${__dirname}/cert/private.key`),
    cert: fs.readFileSync(`${__dirname}/cert/certificate.crt`),
  };

  await http.createServer(app).listen(80);
  logger.info('HTTP 서버 열림.');

  await https.createServer(cert, app).listen(443);
  logger.info('HTTPS 서버 열림.');

  logger.info('');
};
