import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import ErrorMultipleEditorsPage, {
  getServerSideProps,
} from './error-multiple-editors.page';
import { getSessionIdFromCookies } from '../../../utils/session';
import {
  getApplicationFormSummary,
  getLastEditedEmail,
} from '../../../services/ApplicationService';

jest.mock('../../../utils/serviceErrorHelpers');
jest.mock('../../../utils/session');
jest.mock('../../../services/ApplicationService');
(getSessionIdFromCookies as jest.Mock).mockReturnValue('sessionId');
const mockGetApplicationFormSummary = jest.mocked(getApplicationFormSummary);
const mockGetLastEditedEmail = jest.mocked(getLastEditedEmail);

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: { applicationId: 'applicationId' },
    },
    overrides
  );

describe('getServerSideProps', () => {
  beforeEach(() => {
    mockGetApplicationFormSummary.mockResolvedValue({
      grantApplicationId: '',
      grantSchemeId: '',
      applicationName: '',
      applicationStatus: 'DRAFT',
      audit: {
        version: 1,
        created: '',
        createdBy: '',
        lastUpdated: '2024-03-06T17:05:34.493600Z',
        lastUpdateBy: '',
        lastPublished: '',
      },
      sections: [],
    });
    mockGetLastEditedEmail.mockResolvedValue('test@email.com');
  });

  it('should return the correct props', async () => {
    expect(await getServerSideProps(getContext())).toEqual({
      props: {
        pageData: {
          applicationId: 'applicationId',
          lastEditedDate: '6 March 2024 at 5:05pm',
          lastEditedBy: 'test@email.com',
        },
      },
    });
  });

  it('should return unknown date if service fails', async () => {
    mockGetApplicationFormSummary.mockRejectedValue({});
    expect(await getServerSideProps(getContext())).toEqual({
      props: {
        pageData: {
          applicationId: 'applicationId',
          lastEditedDate: 'unknown',
          lastEditedBy: 'test@email.com',
        },
      },
    });
  });

  it('should return unknown email if service fails', async () => {
    mockGetLastEditedEmail.mockRejectedValue({});
    expect(await getServerSideProps(getContext())).toEqual({
      props: {
        pageData: {
          applicationId: 'applicationId',
          lastEditedDate: '6 March 2024 at 5:05pm',
          lastEditedBy: 'unknown',
        },
      },
    });
  });

  it('should pass error text from query string', async () => {
    mockGetLastEditedEmail.mockRejectedValue({});
    expect(
      await getServerSideProps(getContext({ error: 'Custom error text' }))
    ).toEqual({
      props: {
        pageData: {
          errorText: 'Custom error text',
          applicationId: 'applicationId',
          lastEditedDate: '6 March 2024 at 5:05pm',
          lastEditedBy: 'unknown',
        },
      },
    });
  });
});

const getProps = (overrides: any = {}) =>
  merge(
    {
      pageData: {
        applicationId: '123',
        lastEditedBy: 'test@email.com',
        lastEditedDate: '15 February 2023 at 11:15 am',
      },
    },
    overrides
  );

const errorPage = (overrides = {}) => (
  <ErrorMultipleEditorsPage {...getProps(overrides)} />
);

describe('Error page', () => {
  it('Should render correct header', () => {
    render(errorPage());
    screen.getByRole('heading', {
      name: 'Your changes could not be saved',
    });
  });

  it('Should include try again message', () => {
    render(errorPage());
    screen.getByText(
      'Another editor has made changes to the grant and your changes could not be saved.'
    );
  });

  it('Should include information about the error', () => {
    render(errorPage());
    screen.getByText(
      /The last edit was made by test@email.com on 15 February 2023 at 11:15 am./i
    );
  });

  it('Should include redirect link and information', () => {
    render(errorPage());
    screen.getByText(/To try again, you can /i);
    const link = screen.getByRole('link', {
      name: /return to the application builder/i,
    });
    expect(link).toHaveAttribute('href', '/build-application/123/dashboard');
  });

  it('should render unknown email', () => {
    render(errorPage({ pageData: { lastEditedBy: 'unknown' } }));
    screen.getByText(
      /The last edit was made by unknown on 15 February 2023 at 11:15 am./i
    );
  });

  it('should render unknown date', () => {
    render(errorPage({ pageData: { lastEditedDate: 'unknown' } }));
    screen.getByText(/The last edit was made by test@email.com on unknown./i);
  });

  it('should render unknown email and date', () => {
    render(
      errorPage({
        pageData: { lastEditedBy: 'unknown', lastEditedDate: 'unknown' },
      })
    );
    screen.getByText(/The last edit was made by unknown on unknown./i);
  });

  it('Should render a custom error message', () => {
    render(errorPage({ pageData: { errorText: 'Custom error message' } }));
    expect(screen.getByText('Custom error message')).toBeVisible();
  });
});
