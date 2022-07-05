const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const logger = require('../provider/loggerProvider');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.commands = new Collection();

fs.readdirSync(`${__dirname}/commands`)
  .filter((file) => file.endsWith('js'))
  .forEach((file) => {
    const command = require(`${__dirname}/commands/${file}`);
    client.commands.set(command.data.name, command);
  });

fs.readdirSync(`${__dirname}/events`)
  .filter((file) => file.endsWith('js'))
  .forEach((file) => {
    const event = require(`${__dirname}/events/${file}`);

    if (event.once)
      client.once(event.name, async (...args) => {
        await event.execute(client, ...args);
      });
    else
      client.on(event.name, async (...args) => {
        await event.execute(client, ...args);
      });
  });

process.on('unhandledRejection', (error) => {
  logger.error(error.stack);
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = async () => client;
