const prediction = require('./selectMenu/prediction');

module.exports = async (client, interaction) => {
  if (interaction.isSelectMenu()) {
    await prediction(client, interaction);
  }
};
