import { GetServerSidePropsContext, Redirect } from 'next';
import { ValidationError } from 'gap-web-ui';

export type PageBodyResponse = Record<string, string | string[] | number>;
export type FetchPageData = Record<string, any>;

export type QuestionPageGetServerSidePropsType<
  T extends PageBodyResponse,
  K extends FetchPageData,
  V
> = {
  serviceErrorReturnUrl?: string;
  context: GetServerSidePropsContext;
  fetchPageData: (jwt: string) => Promise<K | NextRedirect>;
  handleRequest: (body: T, jwt: string, pageData: K) => Promise<V>;
  jwt: string;
  onSuccessRedirectHref: string | ((result: V) => string);
  onErrorMessage: string;
};

export type PostPageResultProps<
  T extends PageBodyResponse,
  K extends FetchPageData,
  V
> = {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
  handleRequest: (body: T, jwt: string, pageData: K) => Promise<V>;
  onSuccessRedirectHref: string | ((result: V) => string);
  jwt: string;
  onErrorMessage: string;
  resolvedUrl: string;
  serviceErrorReturnUrl?: string;
  pageData: K;
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
