import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmissionSummary, { QuestionRow, SectionCard } from './summary.page';

jest.mock('./sections/[sectionId]/processMultiResponse', () => {
  return {
    ProcessMultiResponse: jest.fn(() => (
      <div data-testid="mock-process-multi-response">Multi Response</div>
    )),
  };
});

jest.mock(
  'next/link',
  () =>
    ({ children }) =>
      children
);

describe('SubmissionSummary', () => {
  const mockSections = [
    {
      sectionId: 'section1',
      sectionTitle: 'Section 1',
      questions: [
        {
          questionId: 'q1',
          fieldTitle: 'Question 1',
          multiResponse: null,
          responseType: 'text',
          response: 'Answer 1',
        },
      ],
    },
    {
      sectionId: 'section2',
      sectionTitle: 'Section 2',
      questions: [
        {
          questionId: 'q2',
          fieldTitle: 'Question 2',
          multiResponse: null,
          responseType: 'text',
          response: 'Answer 2',
        },
      ],
    },
  ];

  const mockProps = {
    sections: mockSections,
    grantSubmissionId: '123',
    mandatoryQuestionId: '456',
    applicationName: 'My Mock Application',
    hasSubmissionBeenSubmitted: false,
    csrfToken: 'abc123',
  };

  it('renders SubmissionSummary component correctly', () => {
    render(<SubmissionSummary {...mockProps} />);

    expect(screen.getByText('My Mock Application')).toBeInTheDocument();
    expect(
      screen.getByText('Check your answers before submitting your application')
    ).toBeInTheDocument();
  });

  it('renders SubmissionSummary component with submitted application text', () => {
    const submittedProps = {
      ...mockProps,
      hasSubmissionBeenSubmitted: true,
    };

    render(<SubmissionSummary {...submittedProps} />);

    expect(screen.getByText('Your application')).toBeInTheDocument();
    expect(screen.getByText('Return to your profile')).toBeInTheDocument();
  });

  it('renders Download section correctly', () => {
    render(<SubmissionSummary {...mockProps} />);
    expect(
      screen.getByText('Download a copy of your application')
    ).toBeInTheDocument();
    expect(
      screen.getByText('download a copy of your answers (ODT)').closest('a')
    ).toBeInTheDocument();
  });

  it('renders "Return to your profile" button when application has been submitted', () => {
    const submittedProps = {
      ...mockProps,
      hasSubmissionBeenSubmitted: true,
    };

    render(<SubmissionSummary {...submittedProps} />);

    expect(screen.getByText('My Mock Application')).toBeInTheDocument();
    expect(screen.getByText('Your application')).toBeInTheDocument();

    expect(
      screen.getByText('Return to your profile').closest('a')
    ).toHaveProperty('href', `http://localhost/applications`);
  });

  it('renders "Submit application" button when application has not been submitted', () => {
    render(<SubmissionSummary {...mockProps} />);
    expect(screen.getByText('My Mock Application')).toBeInTheDocument();
    expect(
      screen.getByText('Check your answers before submitting your application')
    ).toBeInTheDocument();
    expect(screen.getByText('Submit your application')).toBeInTheDocument();
    expect(screen.getByText('Submit application').closest('a')).toHaveProperty(
      'href',
      `http://localhost/submissions/${mockProps.grantSubmissionId}/submit`
    );
  });
});

describe('SectionCard', () => {
  const mockSection = {
    sectionTitle: 'Mock Section',
    questions: [
      {
        questionId: 'q1',
        fieldTitle: 'Question 1',
        multiResponse: null,
        responseType: 'text',
        response: 'Answer 1',
      },
      {
        questionId: 'q2',
        fieldTitle: 'Question 2',
        multiResponse: null,
        responseType: 'text',
        response: 'Answer 2',
      },
    ],
  };

  it('renders SectionCard component correctly', () => {
    render(
      <SectionCard
        section={mockSection}
        submissionId="123"
        mandatoryQuestionId="456"
        readOnly={false}
      />
    );

    expect(screen.getByText('Mock Section')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Answer 2')).toBeInTheDocument();
  });

  it('renders SectionCard with readOnly mode correctly', () => {
    render(
      <SectionCard
        section={mockSection}
        submissionId="123"
        mandatoryQuestionId="456"
        readOnly={true}
      />
    );

    // Check that "Change" is not present in readOnly mode
    expect(screen.queryByText('Change')).toBeNull();
  });
});

describe('QuestionRow', () => {
  const mockQuestion = {
    questionId: 'q1',
    fieldTitle: 'Question 1',
    multiResponse: null,
    responseType: 'text',
    response: 'Answer 1',
  };

  it('renders QuestionRow component correctly', () => {
    render(<QuestionRow question={mockQuestion} readOnly={false} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();

    expect(screen.getByText('Change').closest('a')).toHaveProperty('href', '');
    expect(screen.queryByText('Add')).toBeNull();
  });

  it('renders default values when response is null', () => {
    const nullResponseQuestion = {
      ...mockQuestion,
      response: null,
    };

    render(<QuestionRow question={nullResponseQuestion} readOnly={false} />);

    expect(screen.getByText('-')).toBeInTheDocument();

    expect(screen.getByText('Add').closest('a')).toHaveProperty('href', '');

    expect(screen.queryByText('Change')).toBeNull();
  });

  it('does not render actions when in read-only mode', () => {
    render(<QuestionRow question={mockQuestion} readOnly={true} />);

    expect(screen.queryByText('Change')).toBeNull();
  });

  it('handles link navigation correctly', () => {
    render(<QuestionRow question={mockQuestion} readOnly={false} />);
    userEvent.click(screen.getByText('Change'));
    // TODO add more tests when this is implemented
  });

  it('calls ProcessMultiResponse when multiResponse is present', () => {
    const multiResponseQuestion = {
      ...mockQuestion,
      multiResponse: [{ label: 'Option 1', value: 'option1', selected: true }],
    };

    render(<QuestionRow question={multiResponseQuestion} readOnly={false} />);

    expect(screen.getByText('Multi Response')).toBeInTheDocument();
  });
});
