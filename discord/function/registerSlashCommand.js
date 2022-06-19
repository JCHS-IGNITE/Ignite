const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const logger = require('../../provider/loggerProvider');

module.exports = async () =>
  new Promise((res) => {
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

    const commands = [];

    fs.readdirSync(`${__dirname}/../commands`)
      .filter((file) => file.endsWith('js'))
      .forEach((file) => {
        const command = require(`${__dirname}/../commands/${file}`);
        commands.push(command.data.toJSON());
      });

    logger.info(`슬래시 명령어 등록 시작`);
    rest
      .put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID), { body: commands })
      .then((response) => {
        let count = 0;

        response
          .map((command) => `${command.name}(${command.description})`)
          .forEach((command) => {
            logger.info(`  - '${command}' 명령어 등록.`);
            count += 1;
          });

        logger.info(`총 ${count}개의 슬래시 명령어 등록 성공.`);
        logger.info('');

        res();
      })
      .catch(logger.error);
  });
