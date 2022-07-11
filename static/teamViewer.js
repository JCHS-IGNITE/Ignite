const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../schema/User');
const Team = require('../schema/Team');

dotenv.config();

const getUser = async (id) => {
  const user = await User.findById(id);

  if (user === null) return;

  // eslint-disable-next-line consistent-return
  return {
    name: `[${user.grade}${user.class}${user.stdId.toString().padStart(2, '0')}] ${user.name}`,
    riot: user.riotNickname,
  };
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 3000,
  });

  console.log(
    await Promise.all(
      (
        await Team.find({})
      ).map(async (o) => ({
        name: `[${o.grade}-${o.class}] ${o.name}`,
        member1: await getUser(o.member1),
        member2: await getUser(o.member2),
        member3: await getUser(o.member3),
        member4: await getUser(o.member4),
        member5: await getUser(o.member5),
        spareMember: await getUser(o.spareMember),
      })),
    ),
  );
})();
