import getConfig from 'next/config';

const getLoginUrl = () => {
  const { publicRuntimeConfig } = getConfig();
  return publicRuntimeConfig.oneLoginEnabled
    ? process.env.V2_LOGIN_URL!
    : process.env.LOGIN_URL!;
};

export { getLoginUrl };
