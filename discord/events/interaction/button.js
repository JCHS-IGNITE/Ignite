const manualVerifyFunction = require('./button/manualVerifyFunction');
const recheckDmPermission = require('./button/recheckDmPermission');

module.exports = async (client, interaction) => {
  await manualVerifyFunction(client, interaction);
  await recheckDmPermission(client, interaction);
};
