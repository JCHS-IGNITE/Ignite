const announcement = require('./modal/announcement');
const verify = require('./modal/verify');
const point = require('./modal/point');

module.exports = async (client, interaction) => {
  if (interaction.isModalSubmit()) {
    await announcement(client, interaction);
    await verify(client, interaction);
    await point(client, interaction);
  }
};
