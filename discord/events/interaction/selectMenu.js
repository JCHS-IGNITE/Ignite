const predictionStart = require('./selectMenu/predictionStart');
const predictionEnd = require('./selectMenu/predictionEnd');
const predictionSet1 = require('./selectMenu/predictionSet1');
const predictionSet2 = require('./selectMenu/predictionSet2');

module.exports = async (client, interaction) => {
  if (interaction.isSelectMenu()) {
    await predictionStart(client, interaction);
    await predictionEnd(client, interaction);
    await predictionSet1(client, interaction);
    await predictionSet2(client, interaction);
  }
};
