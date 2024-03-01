import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import InferProps from '../../../types/InferProps';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import { generateErrorMessageFromStatusCode } from '../../../utils/serviceErrorHelpers';
import AdvertErrorPage, { getServerSideProps } from './[errorCode].page';

jest.mock('../../../utils/serviceErrorHelpers');
const advertErrorProps: InferProps<typeof getServerSideProps> = {
  errorMessage: 'test message',
  href: '/test/redirect',
};

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: { code: '400' },
      query: {
        href: '/test/redirect',
      },
    },
    overrides
  );

const advertErrorPage = <AdvertErrorPage {...advertErrorProps} />;
describe('advert-error ', () => {
  describe('Advert error page render', () => {
    it('Should render correct header', () => {
      render(advertErrorPage);
      screen.getByRole('heading', {
        name: 'Sorry, there is a problem with the service',
      });
    });

    it('Should include try again message', () => {
      render(advertErrorPage);
      screen.getByText('Try again later.');
    });

    it('Should include information about the error', () => {
      render(advertErrorPage);
      screen.getByText('test message');
    });

    it('Should include redirect link and information', () => {
      render(advertErrorPage);
      const link = screen.getByRole('link', {
        name: /please return/i,
      });
      expect(link).toHaveAttribute('href', '/apply/admin/test/redirect');
      screen.getByText(/and try again\./i);
    });
  });
  describe('getServerSideProps', () => {
    it('should get the expected props', async () => {
      (generateErrorMessageFromStatusCode as jest.Mock).mockReturnValue(
        advertErrorProps.errorMessage
      );
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;
      expect(result.props).toStrictEqual(advertErrorProps);
    });
  });
});
