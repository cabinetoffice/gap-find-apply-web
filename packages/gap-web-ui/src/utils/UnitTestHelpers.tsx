import { isArray, merge, mergeWith } from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { NextRouter } from 'next/router';
import { render } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import React from 'react';

/**
 *
 * @param defaultProps - A function that returns the default object that will be returned when calling this function
 * @param overrides - Custom overrides for specific attributes of the object
 * @returns - A single combined object with all the default values AND the overrides
 */
const getProps = <T extends Record<string, unknown>>(
  defaultProps: () => T,
  overrides: Optional<T> = {}
) => {
  return mergeWith(defaultProps(), overrides, (obj, src) =>
    isArray(src) ? src : undefined
  ) as T;
};

/**
 *
 * @param defaultContext - A function that returns the default getServerSidePropsContext that will be returned when calling this function
 * @param overrides - Custom overrides for specific attributes of getServerSidePropsContext
 * @returns - A single combined getServerSidePropsContext with some forced default req attributes, all the passed in default values, AND the overrides
 */
const getContext = (
  defaultContext: () => Optional<GetServerSidePropsContext> = () =>
    ({} as Optional<GetServerSidePropsContext>),
  overrides: Optional<GetServerSidePropsContext> = {}
) => {
  return merge(
    {
      req: {
        method: 'GET',
        cookies: { 'gap-test': 'testSessionId' },
      },
      res: {
        getHeader: () => 'some-csrf-token',
      },
      resolvedUrl: '/testResolvedURL',
    },
    defaultContext(),
    overrides
  ) as unknown as GetServerSidePropsContext;
};

/**
 * A type safe function for mocking the response of an async function
 *
 * @param mockedServiceMethod - A mocked async function
 * @param defaultValue - A function that returns a default object that this function returns
 * @param overrides - (OPTIONAL) An additional object to override specific attributes of the defaultValue
 */
const mockServiceMethod = <T extends Record<string, any>>(
  mockedServiceMethod:
    | jest.SpyInstance<Promise<T>, any>
    | jest.MockedFn<(...args: any) => Promise<T>>,
  defaultValue: () => T,
  overrides: Optional<T> = {}
) => {
  mockedServiceMethod.mockResolvedValue(
    merge(defaultValue() as any, overrides)
  );
};

/**
 * A type safe function for asserting a function has been called
 *
 * @param mockedServiceMethod - A mocked function
 * @param numberOfTimesCalled - The number of times you expect the function to be called
 * @param args - A list of parameters you expect the function to be called with
 */
const toHaveBeenCalledWith = <T extends (...args: any) => any>(
  mockedServiceMethod: jest.MockedFn<T>,
  numberOfTimesCalled: number,
  ...args: Parameters<T>
) => {
  expect(mockedServiceMethod).toHaveBeenCalledTimes(numberOfTimesCalled);
  expect(mockedServiceMethod).toHaveBeenCalledWith(...args);
};

const renderWithRouter = (ui: React.ReactNode) => {
  render(
    <RouterContext.Provider
      value={
        {
          basePath: '',
          pathname: '/',
          route: '',
          query: {},
          asPath: '/',
          back: jest.fn(),
          beforePopState: jest.fn(),
          prefetch: jest.fn(),
          push: jest.fn(),
          reload: jest.fn(),
          replace: jest.fn(),
          events: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
          },
          isFallback: false,
          isLocaleDomain: false,
          isReady: true,
          defaultLocale: 'en',
          domainLocales: [],
          isPreview: false,
        } as unknown as NextRouter
      }
    >
      {ui}
    </RouterContext.Provider>
  );
};

/**
 * A type safe function for asserting one object equals another
 *
 * @param actual - The actual received object
 * @param expected - The object we expect actual to equal
 */
const expectObjectEquals = <T extends Record<string, unknown>>(
  actual: T,
  expected: T
) => {
  expect(actual).toStrictEqual(expect.objectContaining<T>(expected));
};

/**
 * Extracts the result of an asynchronous function. Useful to mock service methods with type safety.
 */
type InferServiceMethodResponse<
  T extends (...args: any[]) => Record<string, any>
> = Extract<Awaited<ReturnType<T>>, Record<string, any>>;

/**
 * The same as Partial, BUT also applies to nested object's attributes
 */
type Optional<T> = {
  [P in keyof T]?: Optional<T[P]>;
};

export {
  getProps,
  getContext,
  mockServiceMethod,
  toHaveBeenCalledWith,
  expectObjectEquals,
  renderWithRouter,
};
export type { Optional, InferServiceMethodResponse };
