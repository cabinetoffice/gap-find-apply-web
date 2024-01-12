import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionCard } from './summary.page';

describe('SectionCard', () => {
  const mockSection = {
    sectionTitle: 'Mock Section',
    grantSubmissionId: 'mock-submission-id',
    mandatoryQuestionId: 'mock-mq-id',
    applicationName: 'Application Name',
    hasSubmissionBeenSubmitted: false,
    csrfToken: 'mock-csrf-token',
    questions: [
      {
        responseType: 'text',
        questionId: 'q1',
        fieldTitle: 'Question 1',
        multiResponse: null,
        response: 'Answer 1',
      },
      {
        responseType: 'checkbox',
        questionId: 'q2',
        fieldTitle: 'Question 2',
        multiResponse: [
          { label: 'Option 1', value: 'option1', selected: true },
        ],
        response: null,
      },
    ],
  };

  const mockProps = {
    section: mockSection,
    submissionId: '123',
    mandatoryQuestionId: '456',
  };

  it('renders SectionCard component correctly', () => {
    render(<SectionCard {...mockProps} />);
    expect(screen.getByText('Mock Section')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders default values when response is null', () => {
    const nullResponseSection = {
      ...mockSection,
      questions: [{ ...mockSection.questions[0], response: null }],
    };
    render(<SectionCard {...mockProps} section={nullResponseSection} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('handles link navigation correctly', () => {
    render(<SectionCard {...mockProps} />);
    userEvent.click(screen.getByText('Change'));
  });
});
