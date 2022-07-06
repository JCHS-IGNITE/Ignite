const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const logger = require('../../provider/loggerProvider');

module.exports = async () =>
  new Promise((resolve) => {
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

    const commands = [];
    const contexts = [];

    fs.readdirSync(`${__dirname}/../commands`)
      .filter((file) => file.endsWith('js'))
      .forEach((file) => {
        const command = require(`${__dirname}/../commands/${file}`);
        commands.push(command.data.toJSON());
      });

    fs.readdirSync(`${__dirname}/../context`)
      .filter((file) => file.endsWith('js'))
      .forEach((file) => {
        const context = require(`${__dirname}/../context/${file}`);
        contexts.push(context.data.toJSON());
      });

    logger.info(`Discord API 등록 시작`);
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_BOT_CLIENT_ID,
          process.env.DISCORD_GUILD_ID,
        ),
        {
          body: [...commands, ...contexts],
        },
      )
      .then((response) => {
        let count = 0;

        response
          .filter((o) => o.type === 1)
          .map((command) => `${command.name}`)
          .forEach((command) => {
            logger.info(`  - ${command} 명령어 등록.`);
            count += 1;
          });

        response
          .filter((o) => o.type === 2)
          .map((context) => `${context.name}`)
          .forEach((command) => {
            logger.info(`  - ${command} Context 등록.`);
            count += 1;
          });

        logger.info(`총 ${count}개 등록 성공.`);
        logger.info('');
      });

    resolve();
  });
