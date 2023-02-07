const pino = require('pino');

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    messageKey: 'message',
    mixin: () => ({ name: 'gap' }),
  });

module.exports = {
  logger,
};
