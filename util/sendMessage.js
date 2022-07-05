const { MessageEmbed } = require('discord.js');

module.exports = {
  discord: {
    successVerifyInWelcomeChannel: async (interaction, name, grade, clazz, stdId) => {
      await (
        await interaction.client.channels.fetch(process.env.DISCORD_WELCOME_CHANNEL)
      ).send({
        embeds: [
          new MessageEmbed()
            .setTitle('재학생 인증 성공')
            .setAuthor({
              name: interaction.user.tag,
              iconURL: interaction.user.avatarURL(),
            })
            .setDescription(`<@${interaction.user.id}>`)
            .setColor(0x7bff7b)
            .setTimestamp(new Date())
            .addField('이름', name)
            .addField('학년', grade.toString(), true)
            .addField('반', clazz.toString(), true)
            .addField('번호', stdId.toString(), true),
        ],
      });
    },
    successVerifyInDM: async (user, grade, clazz, stdId, name) => {
      await user.send({
        embeds: [
          new MessageEmbed()
            .setTitle('재학생 인증 성공')
            .setDescription(`${name}(${grade}학년 ${clazz}반 ${stdId}번) 으로 인증되었습니다.`)
            .addField('인증 방법', '리로스쿨 인증')
            .setColor(0x7bff7b)
            .setTimestamp(new Date()),
        ],
      });
    },
  },
};
