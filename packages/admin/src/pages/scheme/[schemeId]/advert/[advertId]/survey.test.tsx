import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import Survey, { getServerSideProps } from './survey.page';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import { merge } from 'lodash';
import { postSurveyResponse } from '../../../../../services/SatisfactionSurveyService';

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
jest.mock('../../../../../utils/parseBody');
jest.mock('../../../../../services/SessionService');
jest.mock('../../../../../services/SatisfactionSurveyService');
jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '',
      replace: jest.fn(),
    };
  },
}));

const mockSchemeParams = {
  backendUrl: 'BACKEND_URL',
  fieldErrors: [],
  schemeId: 'SCHEME_ID',
  sessionId: 'SESSION_ID',
};

const mockFieldErrors = [
  {
    fieldName: 'satisfaction',
    errorMessage: 'Please complete at least one field',
  },
];

const component = <Survey {...mockSchemeParams} />;

describe('Survey page', () => {
  it('Renders the survey page', () => {
    render(component);

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
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('Renders error message when there are field errors', () => {
    render(<Survey {...mockSchemeParams} fieldErrors={mockFieldErrors} />);

    // Check title
    const pageTitle =
      'Error - Please complete at least one field - Satisfaction survey - Manage a grant';
    expect(document.title).toStrictEqual(pageTitle);

    // Check error
    screen.getByText('There is a problem');
    screen.getByText('Please complete at least one field');
  });

  describe('getServerSideProps', () => {
    const getContext = (overrides: any = {}) =>
      merge(
        {
          query: {},
          params: '',
          req: { cookies: { session_id: 'SESSION_ID' } },
        },
        overrides
      );

    it('Returns an empty list of field errors', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.fieldErrors).toStrictEqual([]);
    });
  });

  describe('When handling submission', () => {
    it('Should call postSurveyResponse when submitted', () => {
      render(component);
      const commentInput = screen.getByLabelText(
        'How could we improve this service?'
      );

      // Input values
      fireEvent.click(screen.getByLabelText('Very satisfied'));
      fireEvent.change(commentInput, {
        target: { value: 'Very satisfied!' },
      });

      fireEvent.click(screen.getByText('Send feedback'));

      expect(postSurveyResponse).toHaveBeenCalledTimes(1);
      expect(postSurveyResponse).toHaveBeenCalledWith(
        '5',
        'Very satisfied!',
        'SESSION_ID',
        'BACKEND_URL',
        'advert'
      );
    });
  });
});
