const commandHandler = require('./interaction/command');
const buttonHandler = require('./interaction/button');
const modalHandler = require('./interaction/modal');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    await commandHandler(client, interaction);
    await buttonHandler(client, interaction);
    await modalHandler(client, interaction);
  },
};
