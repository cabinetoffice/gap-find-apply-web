import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';

import {
  getContext,
  getPageProps,
  Optional,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import Survey, { getServerSideProps } from './survey.page';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('../../../services/ApplicationService', () => ({
  getApplicationFormSummary: () => {
    return {
      grantSchemeId: 'SCHEME_ID',
    };
  },
}));
jest.mock('../../../services/SchemeService', () => ({
  getGrantScheme: () => {
    return {
      schemeId: 'SCHEME_ID',
    };
  },
}));
jest.mock('../../../utils/parseBody');
jest.mock('../../../services/SessionService');
jest.mock('../../../services/SatisfactionSurveyService');
jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '',
      replace: jest.fn(),
    };
  },
}));

const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
  req: {
    cookies: {
      'user-service-token': 'jwt',
      sessionId: 'testSessionId',
    },
  },
  query: {
    satisfaction: '1',
    comment: 'Satisfied!',
  },
  params: {
    applicationId: '1',
  },
  res: { getHeader: () => 'testCSRFToken' },
});

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  pageData: {
    satisfaction: '',
    comment: null,
    journey: 'application',
  },
  previousValues: { satisfaction: '', comment: '' },
  csrfToken: 'csrfToken',
  formAction: '/test',
  fieldErrors: [],
});

render(<Survey {...getPageProps(getDefaultProps)} />);

describe('Survey page', () => {
  it('Renders the survey page', () => {
    // Check title & headings
    const pageTitle = 'Satisfaction survey - Manage a grant';
    expect(document.title).toStrictEqual(pageTitle);

    screen.getByText('Give feedback on Manage a grant');
    screen.getByText(
      'Overall, how did you feel about the service you received today?'
    );
    screen.getByLabelText('How could we improve this service?');

    // Check fields
    const radioOptions = screen.getAllByRole('radio');
    const commentInput = screen.getByLabelText(
      'How could we improve this service?'
    );
    const submitButton = screen.getByText('Send feedback');

    expect(radioOptions).toHaveLength(5);
    expect(commentInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('Should call postSurveyResponse when submitted', async () => {
    const result = await getServerSideProps(getContext(getDefaultContext));

    if ('redirect' in result) throw new Error('Should not redirect');

    expect(result.props.pageData).toEqual({
      comment: 'Satisfied!',
      satisfaction: '1',
      journey: 'application',
    });
  });
});
