const axios = require('axios');
const lolRankToString = require('./lolRankToString');

module.exports = async (riotNickname) => {
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

  const obj = {
    nickname: riotResult.data.name,
    level: riotResult.data.summonerLevel,
  };

  if (tiers.length === 0)
    obj.rank = {
      name: '언랭크',
      photo: `https://ddragon.leagueoflegends.com/cdn/12.12.1/img/profileicon/${riotResult.data.profileIconId}.png`,
    };
  else
    obj.rank = {
      name: `${lolRankToString(tiers[0].tier)} ${tiers[0].rank}`,
      photo: `https://opgg-static.akamaized.net/images/medals_new/${tiers[0].tier.toLowerCase()}.png`,
    };

  return obj;
};
