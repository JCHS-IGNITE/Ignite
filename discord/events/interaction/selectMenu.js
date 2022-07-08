const predictionStart = require('./selectMenu/predictionStart');

module.exports = async (client, interaction) => {
  if (interaction.isSelectMenu()) {
    await predictionStart(client, interaction);
  }
};
