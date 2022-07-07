const commandHandler = require('./interaction/command');
const buttonHandler = require('./interaction/button');
const modalHandler = require('./interaction/modal');
const contextMenuHandler = require('./interaction/contextMenu');
const selectMenuHandler = require('./interaction/selectMenu');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    await commandHandler(client, interaction);
    await buttonHandler(client, interaction);
    await modalHandler(client, interaction);
    await contextMenuHandler(client, interaction);
    await selectMenuHandler(client, interaction);
  },
};
