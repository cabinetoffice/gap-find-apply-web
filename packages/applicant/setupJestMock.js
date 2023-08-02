import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import 'urlpattern-polyfill';

jest.mock('csurf', () => {
  return {
    __esModule: true,
    default: () => (req,res,callback) => {
      callback({});
    }
  }
})

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
      subPath: '',
    },
    publicRuntimeConfig: {
      subPath: '',
    },
  };
});
