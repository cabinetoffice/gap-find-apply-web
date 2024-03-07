import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import InferProps from '../../../types/InferProps';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import { generateErrorMessageFromStatusCode } from '../../../utils/serviceErrorHelpers';
import ErrorMultipleEditorsPage, {
  getServerSideProps,
} from './error-multiple-editors.page';

jest.mock('../../../utils/serviceErrorHelpers');
const advertErrorProps: InferProps<typeof getServerSideProps> = {
  pageData: {
    applicationId: '123',
    lastEditedBy: 'test@email.com',
    lastEditedDate: '15 February 2023 at 11:15 am',
  },
};

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: { applicationId: 'applicationId' },
    },
    overrides
  );

const advertErrorPage = <ErrorMultipleEditorsPage {...advertErrorProps} />;

describe('Error page', () => {
  it('Should render correct header', () => {
    render(advertErrorPage);
    screen.getByRole('heading', {
      name: 'Your changes could not be saved',
    });
  });

  it('Should include try again message', () => {
    render(advertErrorPage);
    screen.getByText(
      'Another editor has made changes to the grant and your changes could not be saved.'
    );
  });

  it('Should include information about the error', () => {
    render(advertErrorPage);
    screen.getByText(
      /The last edit was made by test@email.com on 15 February 2023 at 11:15 am./i
    );
  });

  it('Should include redirect link and information', () => {
    render(advertErrorPage);
    screen.getByText(/To try again, you can /i);
    const link = screen.getByRole('link', {
      name: /return to the application builder/i,
    });
    console.log(link);
    expect(link).toHaveAttribute('href', '/build-application/123/dashboard');
  });
});
