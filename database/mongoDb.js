const mongoose = require('mongoose');
const logger = require('../provider/loggerProvider');

module.exports = async () =>
  new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
      })
      .then(() => {
        logger.info('MongoDB 연결 성공.');
        logger.info('');
        resolve();
      })
      .catch(reject);
  });
