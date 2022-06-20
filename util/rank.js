const User = require('../schema/User');

module.exports = {
  pointToRank: async (user) => {
    const ranker = await User.find().sort({ point: 'desc' }).limit(5);
    const { point } = user;

    let result;

    if (ranker[0].discordId === user.discordId) result = '레전드';
    else if (
      ranker[1].discordId === user.discordId ||
      ranker[2].discordId === user.discordId ||
      ranker[3].discordId === user.discordId ||
      ranker[4].discordId === user.discordId
    )
      result = '챌린저';
    else if (point >= 20000) result = '마스터';
    else if (point >= 13500) result = '다이아';
    else if (point >= 9000) result = '플래티넘';
    else if (point >= 6000) result = '골드';
    else if (point >= 3500) result = '실버';
    else if (point >= 1500) result = '브론즈';
    else result = '언랭크';

    return result;
  },
};
