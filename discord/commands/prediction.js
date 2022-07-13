const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const Team = require('../../schema/Team');
const User = require('../../schema/User');
const Match = require('../../schema/Match');

module.exports = {
  async execute(interaction) {
    const command = interaction.options.getSubcommand();

    const user = await User.findOne({ discordId: interaction.user.id });

    if (!user.riotNickname) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription(`승부예측을 만들기 전 라이엇 계정과 연동해주세요.`)
            .setColor(0xff5252),
        ],
      });
    } else {
      if (command === '시작') {
        const matches = await Match.find({});

        const options = (
          await Promise.all(
            matches
              .filter((o) => !o.predictionStart && !o.win)
              .map(async (match) => {
                const team1 = await Team.findById(match.team1);
                const team2 = await Team.findById(match.team2);

                return {
                  label: `[${match.round}R] ${team1.grade}-${team1.class} vs ${team2.grade}-${team2.class}`,
                  description: `[${match.round}R] ${team1.name} vs ${team2.name}`,
                  value: `${match._id}`,
                };
              }),
          )
        ).slice(0, 25);

        if (options.length > 0)
          await interaction.reply({
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId(`prediction_start`)
                  .setOptions(options)
                  .setPlaceholder('승부예측을 시작할 매치를 선택해주세요.'),
              ),
            ],
          });
        else
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
                .setTitle('오류 발생')
                .setDescription('등록된 매치가 없습니다.')
                .setColor(0xff5252),
            ],
          });
      } else if (command === '마감') {
        const matches = await Match.find({});

        const options = (
          await Promise.all(
            matches
              .filter((o) => o.predictionStart && !o.predictionEnd && !o.win)
              .map(async (match) => {
                const team1 = await Team.findById(match.team1);
                const team2 = await Team.findById(match.team2);

                return {
                  label: `[${match.round}R] ${team1.grade}-${team1.class} vs ${team2.grade}-${team2.class}`,
                  description: `[${match.round}R] ${team1.name} vs ${team2.name}`,
                  value: `${match._id}`,
                };
              }),
          )
        ).slice(0, 25);

        if (options.length > 0)
          await interaction.reply({
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId(`prediction_end`)
                  .setOptions(options)
                  .setPlaceholder('승부예측을 마감할 매치를 선택해주세요.'),
              ),
            ],
          });
        else
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
                .setTitle('오류 발생')
                .setDescription('승부예측을 마감할 경기가 없습니다.')
                .setColor(0xff5252),
            ],
          });
      } else if (command === '결과입력') {
        const matches = await Match.find({});

        const options = (
          await Promise.all(
            matches
              .filter((o) => o.predictionStart && o.predictionEnd && !o.win)
              .map(async (match) => {
                const team1 = await Team.findById(match.team1);
                const team2 = await Team.findById(match.team2);

                return {
                  label: `[${match.round}R] ${team1.grade}-${team1.class} vs ${team2.grade}-${team2.class}`,
                  description: `[${match.round}R] ${team1.name} vs ${team2.name}`,
                  value: `${match._id}`,
                };
              }),
          )
        ).slice(0, 25);

        if (options.length > 0)
          await interaction.reply({
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId(`prediction_set1`)
                  .setOptions(options)
                  .setPlaceholder('승부를 입력할 매치를 선택해주세요.'),
              ),
            ],
          });
        else
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
                .setTitle('오류 발생')
                .setDescription('승부를 입력할 경기가 없습니다.')
                .setColor(0xff5252),
            ],
          });
      }
    }
  },
  data: new SlashCommandBuilder()
    .setName('승부예측')
    .setDescription('[관리자] 승부예측 시스템을 관리합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((command) => command.setName('시작').setDescription('승부예측을 시작합니다.'))
    .addSubcommand((command) => command.setName('마감').setDescription('승부예측을 마감합니다.'))
    .addSubcommand((command) =>
      command.setName('결과입력').setDescription('승부 결과를 입력합니다.'),
    ),
};
