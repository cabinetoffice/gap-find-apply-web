import { render } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import React from 'react';
import { createMockRouter } from './createMockRouter';

/**
 *
 * @param defaultProps - A function that returns the default object that will be returned when calling this function
 * @param overrides - Custom overrides for specific attributes of the object
 * @returns - A single combined object with all the default values AND the overrides
 */
const getPageProps = <T extends object>(
  defaultProps: () => T,
  overrides: Optional<T> = {}
) => {
  return merge(defaultProps(), overrides) as T;
};

/**
 *
 * @param defaultContext - A function that returns the default getServerSidePropsContext that will be returned when calling this function
 * @param overrides - Custom overrides for specific attributes of getServerSidePropsContext
 * @returns - A single combined getServerSidePropsContext with some forced default req attributes, all the passed in default values, AND the overrides
 */
const getContext = (
  defaultContext: () => Optional<GetServerSidePropsContext>,
  overrides: Optional<GetServerSidePropsContext> = {}
) => {
  return merge(
    {
      req: {
        method: 'GET',
        cookies: { 'gap-test': 'testSessionId' },
        csrfToken: () => 'testCSRFToken',
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
const mockServiceMethod = <T extends object>(
  mockedServiceMethod:
    | jest.SpyInstance<Promise<T>, object[]>
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
    <RouterContext.Provider value={createMockRouter({})}>
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
const expectObjectEquals = <T extends object>(actual: T, expected: T) => {
  expect(actual).toStrictEqual(expect.objectContaining<T>(expected));
};

/**
 * Extracts the result of an asynchronous function. Useful to mock service methods with type safety.
 */
type InferServiceMethodResponse<T extends (...args: any[]) => object> = Extract<
  Awaited<ReturnType<T>>,
  object
>;

/**
 * The same as Partial, BUT also applies to nested object's attributes
 */
type Optional<T> = {
  [P in keyof T]?: Optional<T[P]>;
};

type Overrides<T> = {
  [key: string]: Overrides<T> | T;
};
export {
  expectObjectEquals,
  getContext,
  getPageProps,
  mockServiceMethod,
  renderWithRouter,
  toHaveBeenCalledWith,
};
export type { InferServiceMethodResponse, Optional, Overrides };
