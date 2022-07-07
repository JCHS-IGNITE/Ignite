const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const User = require('../../schema/User');
const lolRankToString = require('../../util/lolRankToString');

module.exports = {
  async execute(interaction) {
    try {
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
              .setDescription(
                `이미 다른 계정에 연동된 라이엇 계정입니다.\n<@${existUser.discordId}>`,
              )
              .setColor(0xff5252),
          ],
        });
      } else {
        const riotResult = await axios.get(
          `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
            riotNickname,
          )}`,
          { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } },
        );

        const riotResult2 = await axios.get(
          `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${riotResult.data.id}`,
          { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } },
        );

        const tiers = riotResult2.data.filter((o) => o.queueType === 'RANKED_SOLO_5x5');

        const embed = new MessageEmbed()
          .setTitle('라이엇 연동 성공')
          .setDescription(`라이엇 계정에 연동했습니다.`)
          .addField('닉네임', riotResult.data.name, true)
          .addField('레벨', riotResult.data.summonerLevel.toString(), true)
          .setColor(0x7bff7b);

        if (tiers.length === 0)
          embed
            .addField('랭크', `언랭크`, true)
            .setThumbnail(
              `https://ddragon.leagueoflegends.com/cdn/12.12.1/img/profileicon/${riotResult.data.profileIconId}.png`,
            );
        else
          embed
            .addField('랭크', `${lolRankToString(tiers[0].tier)} ${tiers[0].rank}`, true)
            .setThumbnail(
              `https://opgg-static.akamaized.net/images/medals_new/${tiers[0].tier.toLowerCase()}.png`,
            );

        await User.updateOne({ discordId: interaction.user.id }, { riotNickname });

        await interaction.reply({
          embeds: [embed],
        });
      }
    } catch (e) {
      console.error(e);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription('라이엇 서버에서 계정을 찾을 수 없습니다.\n닉네임을 확인해주세요.')
            .setColor(0xff5252),
        ],
      });
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
