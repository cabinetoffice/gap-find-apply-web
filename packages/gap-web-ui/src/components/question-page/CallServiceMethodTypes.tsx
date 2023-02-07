type Body<T> = T & {
  _csrf: string;
};

type ServiceError = {
  errorInformation: string;
  linkAttributes?: {
    href: string;
    linkText: string;
    linkInformation: string;
  };
};

export { Body, ServiceError };
