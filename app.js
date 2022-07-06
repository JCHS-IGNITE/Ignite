require('dotenv').config();

const discordBot = require('./discord/bot');
const mongodb = require('./database/mongoDb');
const registerDiscordApi = require('./discord/function/registerDiscordApi');
const printLogo = require('./util/printLogo');
const logger = require('./provider/loggerProvider');

(async () => {
  try {
    printLogo();
    await mongodb();
    await registerDiscordApi();
    await discordBot();
  } catch (e) {
    logger.error(e.stack);
    process.exit();
  }
})();
