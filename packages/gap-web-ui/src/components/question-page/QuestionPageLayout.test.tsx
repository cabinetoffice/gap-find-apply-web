import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import QuestionPageLayout, { QuestionPageProps } from './QuestionPageLayout';

const customProps: QuestionPageProps = {
  csrfToken: 'csrfToken',
  formAction: '/formAction',
  questionTitle: 'Page title',
  pageCaption: 'Some page caption',
  questionHintText:
    'A description of the page and the question what it is asking',
  fieldName: 'fieldName',
  fieldErrors: [],
  inputType: {
    type: 'text-input',
  },
  buttons: [{ text: 'Save and continue' }],
};

const component = <QuestionPageLayout {...customProps} />;

describe('Question Page component', () => {
  it('Renders a continue button', () => {
    render(component);
    screen.getByRole('button', { name: 'Save and continue' });
  });

  it('Renders all the buttons passed in the prop when there is more than 1', () => {
    const propsWithMoreButton: QuestionPageProps = {
      ...customProps,
      buttons: [...customProps.buttons, { text: 'Save and exit' }],
    };
    render(<QuestionPageLayout {...propsWithMoreButton} />);
    screen.getByRole('button', { name: 'Save and continue' });
    screen.getByRole('button', { name: 'Save and exit' });
  });

  it('Renders correct page caption when it is provided', () => {
    render(component);
    screen.getByText('Some page caption');
  });

  it('It does NOT render page caption when none is provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pageCaption, ...noCaptionProps } = customProps;
    render(<QuestionPageLayout {...noCaptionProps} />);
    expect(screen.queryByTestId('question-page-caption')).toBeFalsy();
  });

  it('The form is assigned the provided form action', () => {
    render(component);
    const formElement = screen.getByTestId('form-test-id');
    expect(formElement).toHaveAttribute('action', '/formAction');
  });

  it('Renders the Input Controller output', () => {
    render(component);
    screen.getByTestId('text-input-component');
  });

  it('Renders an error banner', () => {
    const customPropsWithError = {
      ...customProps,
      fieldErrors: [
        {
          fieldName: customProps.fieldName,
          errorMessage: 'This field is required.',
        },
      ],
    };
    render(<QuestionPageLayout {...customPropsWithError} />);
    screen.getByRole('alert');
  });
});
