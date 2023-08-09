import { GetServerSidePropsContext, Redirect } from 'next';
import { ValidationError } from '../../types';

type PageBodyResponse = Record<string, string | string[]>;
type FetchPageData = Record<string, any>;

type QuestionPageGetServerSidePropsType<T, K, V> = {
  context: GetServerSidePropsContext;
  fetchPageData: (jwt: string) => Promise<K>;
  handleRequest: (body: T, jwt: string) => Promise<V>;
  jwt: string;
  onSuccessRedirectHref: string | ((result: V) => string);
  onErrorMessage: string;
};

type PostPageResultProps<T extends PageBodyResponse, V> = {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
  handleRequest: (body: T, jwt: string) => Promise<V>;
  onSuccessRedirectHref: string | ((result: V) => string);
  jwt: string;
  onErrorMessage: string;
  resolvedUrl: string;
};

type generateValidationPropsType<T> = void | {
  body: T;
  fieldErrors: ValidationError[];
};

type NextRedirect = {
  redirect: Redirect;
};

export {
  QuestionPageGetServerSidePropsType,
  PostPageResultProps,
  PageBodyResponse,
  FetchPageData,
  generateValidationPropsType,
  NextRedirect,
};
