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
    return `${process.env.USER_SERVICE_URL}/v2/login?redirectUrl=${process.env.APPLICANT_DOMAIN}`;
  }
  return oneLoginEnabled ? process.env.V2_LOGIN_URL : process.env.LOGIN_URL;
};

export { isJSEnabled, downloadFile, getObjEntriesByKeySubstr, getLoginUrl };
