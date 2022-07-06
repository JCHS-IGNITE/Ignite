const User = require('../schema/User');

module.exports = {
  pointToRank: async (user) => {
    const ranker = await User.find().sort({ point: 'desc' }).limit(10);
    const { point } = user;

    let result;

    if (ranker[0].discordId === user.discordId) result = '레전드';
    else if (ranker[1].discordId === user.discordId || ranker[2].discordId === user.discordId)
      result = '챌린저';
    else if (
      ranker[3].discordId === user.discordId ||
      ranker[4].discordId === user.discordId ||
      ranker[5].discordId === user.discordId
    )
      result = '마스터';
    else if (
      ranker[6].discordId === user.discordId ||
      ranker[7].discordId === user.discordId ||
      ranker[8].discordId === user.discordId ||
      ranker[9].discordId === user.discordId
    )
      result = '다이아';
    else if (point >= 20000) result = '플래티넘';
    else if (point >= 10000) result = '골드';
    else if (point >= 5000) result = '실버';
    else if (point >= 2000) result = '브론즈';
    else result = '언랭크';

    return result;
  },
};
