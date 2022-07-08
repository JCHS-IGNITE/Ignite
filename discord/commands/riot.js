const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../schema/User');
const fetchRiot = require('../../util/fetchRiot');

module.exports = {
  async execute(interaction) {
    const riotNickname = interaction.options.getString('닉네임');

    const existUser = await User.findOne({ riotNickname });
    const existUser2 = await User.findOne({ discordId: interaction.user.id });

    if (existUser2.riotNickname)
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription(
              `이미 이 계정은 라이엇 계정(${existUser2.riotNickname})과 연동되어 있습니다.>`,
            )
            .setColor(0xff5252),
        ],
      });
    else if (existUser && existUser !== interaction.user.id) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription(`이미 다른 계정에 연동된 라이엇 계정입니다.\n<@${existUser.discordId}>`)
            .setColor(0xff5252),
        ],
      });
    } else {
      try {
        const riot = await fetchRiot(riotNickname);

        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('라이엇 연동 성공')
              .setDescription(`라이엇 계정에 연동했습니다.`)
              .addField('닉네임', riot.nickname, true)
              .addField('레벨', riot.level.toString(), true)
              .addField('랭크', riot.rank.name, true)
              .setThumbnail(riot.rank.photo)
              .setColor(0x7bff7b),
          ],
        });

        await User.updateOne({ discordId: interaction.user.id }, { riotNickname });
      } catch (e) {
        console.error(e);

        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle('오류 발생')
              .setDescription(`존재하지 않는 계정입니다.`)
              .setColor(0xff5252),
          ],
        });
      }
    }
  },
  data: new SlashCommandBuilder()
    .setName('라이엇연동')
    .setDescription('라이엇 계정을 연동합니다.')
    .addStringOption((option) =>
      option
        .setName('닉네임')
        .setDescription('라이엇 닉네임을 입력해주세요. (공백 포함)')
        .setRequired(true),
    )
    .setDMPermission(false),
};
