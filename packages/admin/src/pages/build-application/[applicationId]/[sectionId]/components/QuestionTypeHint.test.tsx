import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuestionTypeHint from './QuestionTypeHint';

describe('Question type', () => {
  const component = (
    <QuestionTypeHint
      description="A hint explaining the input type"
      imageFileName="text-input"
      imageAlt="A description of the provided image"
      questionType="test-question"
      detailsTitle="test-details-title"
    />
  );

  beforeEach(() => {
    render(component);
  });

  it('Should render a hint description', () => {
    screen.getByText('A hint explaining the input type');
  });

  it('Should render a clickable "details" section named test-details-title', () => {
    screen.getByText('test-details-title');
  });

  it('Should render an image', () => {
    screen.getByRole('img', {
      name: 'A description of the provided image',
    });
  });
});
