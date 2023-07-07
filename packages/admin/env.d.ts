declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUB_PATH: string;
      APPLICANT_DOMAIN: string;
      MAX_COOKIE_AGE: string;
      JWT_COOKIE_NAME: string;
      LOGIN_URL: string;
      LOGOUT_URL: string;
      SESSION_COOKIE_NAME: string;
      BACKEND_HOST: string;
      COOKIE_SECRET: string;
      SPOTLIGHT_URL: string;
      TINYMCE_API_KEY: string;
      FEATURE_ADVERT_BUILDER: string;
      ONE_LOGIN: string;
      V2_LOGIN_URL: string;
      V2_LOGOUT_URL: string;
      ONE_LOGIN_ENABLED: string;
    }
  }
}

export {};
