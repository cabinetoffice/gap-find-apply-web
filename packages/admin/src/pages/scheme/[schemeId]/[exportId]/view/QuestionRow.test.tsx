import { render, screen } from '@testing-library/react';
import { QuestionRow } from './QuestionRow.component';

describe('QuestionRow', () => {
  const mockQuestion = {
    questionId: 'q1',
    fieldTitle: 'Question 1',
    responseType: 'text',
    response: 'Answer 1',
    validation: {
      mandatory: true,
    },
  };

  it('renders QuestionRow component correctly', () => {
    render(<QuestionRow {...mockQuestion} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
  });

  it('renders default values when response is missing', () => {
    const noResponseQuestion = {
      ...mockQuestion,
      response: '',
    };

    render(<QuestionRow {...noResponseQuestion} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should call ProcessMultiResponse when multiResponse is present and format response correctly', () => {
    const multiResponse = ['Option 1', 'Option 2', 'Option 3'];
    const multiResponseQuestion = {
      ...mockQuestion,
      multiResponse,
    };

    render(<QuestionRow {...multiResponseQuestion} />);
    expect(screen.getByText('Option 1,')).toBeInTheDocument();
    expect(screen.getByText('Option 2,')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('does not call ProcessMultiResponse when multiResponse is empty array', () => {
    const multiResponseQuestion = {
      ...mockQuestion,
      response: undefined,
      multiResponse: [],
    };

    render(<QuestionRow {...multiResponseQuestion} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
