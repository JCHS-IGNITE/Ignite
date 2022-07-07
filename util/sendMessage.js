const { MessageEmbed } = require('discord.js');

module.exports = {
  discord: {
    successVerifyInDM: async (user, grade, clazz, stdId, name) => {
      await user.send({
        embeds: [
          new MessageEmbed()
            .setTitle('재학생 인증 성공')
            .setDescription(`${name}(${grade}학년 ${clazz}반 ${stdId}번) 으로 인증되었습니다.`)
            .addField('인증 방법', '리로스쿨 인증')
            .setColor(0x7bff7b),
        ],
      });
    },
  },
};
