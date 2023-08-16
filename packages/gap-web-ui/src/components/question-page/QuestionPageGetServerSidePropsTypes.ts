import { GetServerSidePropsContext, Redirect } from 'next';

interface ValidationError {
  fieldName: string;
  errorMessage: string;
}

type PageBodyResponse = Record<string, string | string[]>;
type FetchPageData = Record<string, any>;

type QuestionPageGetServerSidePropsType<T, K, V> = {
  context: GetServerSidePropsContext;
  fetchPageData: (jwt: string) => Promise<K>;
  handleRequest: (body: T, jwt: string) => Promise<V>;
  jwt: string;
  onSuccessRedirectHref: string | ((result: V) => string);
  onErrorMessage: string;
  useHandleRequestForPageData?: boolean;
};

type PostPageResultProps<T extends PageBodyResponse, V> = {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
  handleRequest: (body: T, jwt: string) => Promise<V>;
  onSuccessRedirectHref: string | ((result: V) => string);
  jwt: string;
  onErrorMessage: string;
  resolvedUrl: string;
  useHandleRequestForPageData?: boolean;
};

type generateValidationPropsType<T> = void | {
  body: T;
  fieldErrors: ValidationError[];
};

type NextRedirect = {
  redirect: Redirect;
};

export {
  ValidationError,
  QuestionPageGetServerSidePropsType,
  PostPageResultProps,
  PageBodyResponse,
  FetchPageData,
  generateValidationPropsType,
  NextRedirect,
};
