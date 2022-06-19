const logger = require('../../provider/loggerProvider');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info('봇 로그인 성공.');
    logger.info(`  - ${client.user.tag}`);
    logger.info(`  - ${client.user.id}`);
    logger.info('');

    client.user.setActivity({ name: 'IGNITE', type: 'COMPETING' });
  },
};
