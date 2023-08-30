import { GetServerSidePropsContext, Redirect } from 'next';
import { ValidationError } from 'gap-web-ui';

export type PageBodyResponse = Record<string, string | string[]>;
export type FetchPageData = Record<string, any>;

export type QuestionPageGetServerSidePropsType<T, K, V> = {
  context: GetServerSidePropsContext;
  fetchPageData: (jwt: string) => Promise<K>;
  handleRequest: (body: T, jwt: string) => Promise<V>;
  jwt: string;
  onSuccessRedirectHref: string | ((result: V) => string);
  onErrorMessage: string;
};

export type PostPageResultProps<T extends PageBodyResponse, V> = {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
  handleRequest: (body: T, jwt: string) => Promise<V>;
  onSuccessRedirectHref: string | ((result: V) => string);
  jwt: string;
  onErrorMessage: string;
  resolvedUrl: string;
};

export type generateValidationPropsType<T> =
  | void
  | {
      body: T;
      fieldErrors: ValidationError[];
    }
  | { nonPost: true };

export type NextRedirect = {
  redirect: Redirect;
};

export type { ValidationError };
