const mongoose = require('mongoose');
const logger = require('../provider/loggerProvider');

module.exports = async () =>
  new Promise((res) => {
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
      })
      .then(() => {
        logger.info('MongoDB 연결 성공.');
        logger.info('');
        res();
      })
      .catch(logger.error);
  });
