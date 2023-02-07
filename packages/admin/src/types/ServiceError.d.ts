type ServiceError = {
  errorInformation: string;
  linkAttributes?: LinkAttributes;
};

type LinkAttributes = {
  href: string;
  linkText: string;
  linkInformation: string;
};

export default ServiceError;
