import { logger } from './logger';

const isJSEnabled = () => {
  return typeof window !== 'undefined';
};

const delay = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const downloadFile = async (url: string, name: string) => {
  const a = document.createElement('a');
  a.download = name;
  a.href = url;
  // a.style.display = 'none';
  // document.body.append(a);
  a.click();

  // Some browsers require a delay. Otherwise they request a permission to download multiple files
  await delay(200);
  // a.remove();
};

const getObjEntriesByKeySubstr = (substr: string, obj: object) => {
  return Object.entries(obj).filter(([key]) => key.includes(substr));
};

type GetLoginUrlOptions = {
  redirectToApplicant?: boolean;
};

const getLoginUrl = (options?: GetLoginUrlOptions) => {
  const oneLoginEnabled = process.env.ONE_LOGIN_ENABLED === 'true';
  if (options?.redirectToApplicant && oneLoginEnabled) {
    return `${process.env.V2_LOGIN_URL}?redirectUrl=${process.env.APPLICANT_DOMAIN}/dashboard`;
  }
  return oneLoginEnabled
    ? (process.env.V2_LOGIN_URL as string)
    : (process.env.LOGIN_URL as string);
};

const validateRedirectUrl = (redirectUrl: string) => {
  const isInternalRedirect = redirectUrl.startsWith('/');
  if (isInternalRedirect) return;

  const url = new URL(redirectUrl);

  const redirectUrlHost = (url.protocol + '//' + url.host).replace('www.', '');

  const isValid = redirectUrlHost.startsWith(process.env.FIND_A_GRANT_URL);

  if (!isValid) {
    logger.error('admin redirect was invalid', { redirectUrl });
    throw new Error('Invalid redirect URL');
  }
};

const buildQueryStringWithoutUndefinedValues = (obj: { [x: string]: any }) => {
  const strippedObj = Object.keys(obj).reduce(
    (acc, key) =>
      obj[key] === undefined ? { ...acc } : { ...acc, [key]: obj[key] },
    {}
  );
  return Object.keys(strippedObj).length > 0
    ? '?' + new URLSearchParams(strippedObj)
    : '';
};

const parseJwt = (token: string) =>
  JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

export {
  parseJwt,
  validateRedirectUrl,
  isJSEnabled,
  downloadFile,
  getObjEntriesByKeySubstr,
  getLoginUrl,
  buildQueryStringWithoutUndefinedValues,
};
