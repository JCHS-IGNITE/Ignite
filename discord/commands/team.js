const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../schema/User');
const fetchRiot = require('../../util/fetchRiot');
const Team = require('../../schema/Team');

module.exports = {
  async execute(interaction) {
    const command = interaction.options.getSubcommand();

    const user = await User.findOne({ discordId: interaction.user.id });
    const team = await Team.findOne({ grade: user.grade, class: user.class });

    if (!team)
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle('오류 발생')
            .setDescription('해당 학급에 생성된 팀이 없습니다.\n관리자에게 문의해주세요.')
            .setColor(0xff5252),
        ],
      });
    else {
      const exist = await Team.findOne({
        $or: [
          { member1: user._id },
          { member2: user._id },
          { member3: user._id },
          { member4: user._id },
          { member5: user._id },
          { spareMember: user._id },
        ],
      });

      if (command === '확인') {
        const teamUser = await Promise.all(
          Object.entries(team._doc)
            .filter((obj) => obj[0].startsWith('member'))
            .map((obj) => obj[1])
            .map((obj) => obj._id)
            .map((id) => User.findById(id)),
        );
        const teamRiot = await Promise.all(
          teamUser.map(async (sUser) => ({
            discordId: sUser.discordId,
            riotInfo: await fetchRiot(sUser.riotNickname),
          })),
        );
        const teamMember = teamRiot.map(
          (sUser) =>
            `<@${sUser.discordId}> | [${sUser.riotInfo.rank.name}] ${sUser.riotInfo.nickname}`,
        );

        if (team.spareMember) {
          const sUser = await User.findById(team.spareMember);
          const riot = await fetchRiot(sUser.riotNickname);
          teamMember.push(`<@${sUser.discordId}> | *<예비> [${riot.rank.name}] ${riot.nickname}*`);
        }

        await interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setTitle(`[${team.grade}-${team.class}] ${team.name}`)
              .setDescription(teamMember.join('\n'))
              .setColor(0x66ccff),
          ],
        });
      } else if (command === '가입') {
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
          if (exist) {
            await interaction.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setTitle('오류 발생')
                  .setDescription('이미 팀에 참가중입니다.')
                  .setColor(0xff5252),
              ],
            });
          } else {
            const isSparePlayer = interaction.options.getBoolean('예비선수');

            const empty = [];

            if (isSparePlayer && !team.spareMember) empty.push('spareMember');
            else if (!isSparePlayer)
              for (let i = 1; i <= 5; i += 1) if (!team[`member${i}`]) empty.push(`member${i}`);

            if (empty.length > 0) {
              const updateQry = {};
              updateQry[empty[0]] = user._id;

              await Team.updateOne({ grade: user.grade, class: user.class }, updateQry);

              await interaction.member.roles.add(process.env.DISCORD_ESPORT_PLAYER_ROLE);

              await interaction.reply({
                ephemeral: true,
                embeds: [
                  new MessageEmbed()
                    .setTitle('팀 가입')
                    .setDescription(`[${team.grade}-${team.class}] ${team.name} 팀에 가입했습니다.`)
                    .setColor(0x7bff7b),
                ],
              });
            } else {
              const members = await Promise.all(
                [
                  team.member1,
                  team.member2,
                  team.member3,
                  team.member4,
                  team.member5,
                  team.spareMember,
                ].map((id) => User.findById(id)),
              );

              const teams = (
                await Promise.all(
                  members
                    .filter((o) => o !== null)
                    .map(async (o) => ({
                      discordId: o.discordId,
                      riot: await fetchRiot(o.riotNickname),
                    })),
                )
              )
                .map((o) => `<@${o.discordId}>  :  [${o.riot.rank.name}] ${o.riot.nickname}`)
                .join('\n');

              await interaction.reply({
                ephemeral: true,
                embeds: [
                  new MessageEmbed()
                    .setTitle('오류 발생')
                    .setDescription(`팀이 모두 찼습니다.\n\n${teams}`)
                    .setColor(0xff5252),
                ],
              });
            }
          }
        }
      }
    }
  },
  data: new SlashCommandBuilder()
    .setName('팀')
    .setDescription('학급 이스포츠 관리 명령어')
    .setDMPermission(false)
    .addSubcommand((command) => command.setName('확인').setDescription('팀의 멤버를 확인합니다.'))
    .addSubcommand((command) =>
      command
        .setName('가입')
        .setDescription('팀에 가입합니다.')
        .addBooleanOption((option) =>
          option.setName('예비선수').setDescription('예비 선수일 경우 체크해주세요.'),
        ),
    ),
};
