const manualVerify = require('./button/manualVerify');
const manualVerifyTeacher = require('./button/manualVerifyTeacher');
const recheckDmPermission = require('./button/recheckDmPermission');
const predictionStart = require('./button/predictionStart');
const predictionSurvey = require('./button/predictionSurvey');
const predictionRoleManager = require('./button/predictionRoleManager');

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    await manualVerify(client, interaction);
    await manualVerifyTeacher(client, interaction);
    await recheckDmPermission(client, interaction);
    await predictionStart(client, interaction);
    await predictionSurvey(client, interaction);
    await predictionRoleManager(client, interaction);
  }
};
