const manualVerifyFunction = require('./button/manualVerifyFunction');
const recheckDmPermission = require('./button/recheckDmPermission');
const predictionConfirm = require('./button/predictionConfirm');
const predictionExit = require('./button/predictionExit');

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    await manualVerifyFunction(client, interaction);
    await recheckDmPermission(client, interaction);
    await predictionConfirm(client, interaction);
    await predictionExit(client, interaction);
  }
};
