require('dotenv').config();

const discordBot = require('./discord/bot');
const mongodb = require('./database/mongoDb');
const registerSlashCommand = require('./discord/function/registerSlashCommand');
const printLogo = require('./util/printLogo');
const logger = require('./provider/loggerProvider');

(async () => {
  try {
    printLogo();
    await mongodb();
    await registerSlashCommand();
    await discordBot();
  } catch (e) {
    logger.error(e.message);
    process.exit();
  }
})();
