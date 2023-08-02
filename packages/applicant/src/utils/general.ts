const getLoginUrl = () => {
  return process.env.ONE_LOGIN_ENABLED === 'enabled'
    ? process.env.V2_LOGIN_URL
    : process.env.LOGIN_URL;
};

export { getLoginUrl };
