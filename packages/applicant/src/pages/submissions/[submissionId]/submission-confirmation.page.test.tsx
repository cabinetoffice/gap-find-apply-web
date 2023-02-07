import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../../testUtils/createMockRouter';
import SubmissionConfirmation, {
  getServerSideProps,
} from './submission-confirmation.page';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../services/SubmissionService');
jest.mock('../../../utils/jwt');
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

const context = {
  params: {
    submissionId: '12345678',
  },
  req: { csrfToken: () => 'testCSRFToken' },
  res: {},
} as unknown as GetServerSidePropsContext;

describe('geServeSideProps', () => {
  it('should return the correct object from server side props', async () => {
    const response = await getServerSideProps(context);
    expect(response).toEqual({ props: {} });
  });
});
describe('Submission confirmation page', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/submissions/${context.params.submissionId}/submission-confirmation`,
        })}
      >
        <SubmissionConfirmation />
      </RouterContext.Provider>
    );
  });

  it('should render panel', () => {
    expect(
      screen.getByRole('heading', {
        name: /application submitted/i,
      })
    ).toBeDefined();
  });

  it('should render heading', () => {
    expect(
      screen.getByRole('heading', {
        name: /what happens next/i,
      })
    ).toBeDefined();
  });

  it('should render body text', () => {
    expect(
      screen.getByText(
        /the funding organisation will contact you once they have reviewed your application\./i
      )
    ).toBeDefined();
  });
});
