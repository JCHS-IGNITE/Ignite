const manualVerifyFunction = require('./button/manualVerifyFunction');
const recheckDmPermission = require('./button/recheckDmPermission');

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    await manualVerifyFunction(client, interaction);
    await recheckDmPermission(client, interaction);
  }
};
