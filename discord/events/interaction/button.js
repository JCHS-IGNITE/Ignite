const manualVerify = require('./button/manualVerify');
const recheckDmPermission = require('./button/recheckDmPermission');
const predictionStart = require('./button/predictionStart');
const predictionSurvey = require('./button/predictionSurvey');

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    await manualVerify(client, interaction);
    await recheckDmPermission(client, interaction);
    await predictionStart(client, interaction);
    await predictionSurvey(client, interaction);
  }
};
