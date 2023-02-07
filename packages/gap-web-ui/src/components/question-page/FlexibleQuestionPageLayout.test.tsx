import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FlexibleQuestionPageLayout, {
  FlexibleQuestionPageProps,
} from './FlexibleQuestionPageLayout';

const customProps: FlexibleQuestionPageProps = {
  csrfToken: 'csrfToken',
  formAction: '/formAction',
  pageCaption: 'Some page caption',
  fieldErrors: [],
  encType: 'application/x-www-form-urlencoded',
};

const component = <FlexibleQuestionPageLayout {...customProps} />;

describe('Question Page component', () => {
  it('Renders every passed in child', () => {
    customProps.children = (
      <>
        <p>Test child component</p>
        <button>Save and exit</button>
      </>
    );
    render(<FlexibleQuestionPageLayout {...customProps} />);
    screen.getByText('Test child component');
    screen.getByRole('button', { name: 'Save and exit' });
  });

  it('Renders correct page caption when it is provided', () => {
    render(component);
    screen.getByText('Some page caption');
  });

  it('It does NOT render page caption when none is provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pageCaption, ...noCaptionProps } = customProps;
    render(<FlexibleQuestionPageLayout {...noCaptionProps} />);
    expect(screen.queryByTestId('question-page-caption')).toBeFalsy();
  });

  it('The form is assigned the provided form action', () => {
    render(component);
    const formElement = screen.getByTestId('question-page-form');
    expect(formElement).toHaveAttribute('action', '/formAction');
  });

  it('Renders an error banner', () => {
    const customPropsWithError = {
      ...customProps,
      fieldErrors: [
        {
          fieldName: 'fieldName',
          errorMessage: 'This field is required.',
        },
      ],
    };
    render(<FlexibleQuestionPageLayout {...customPropsWithError} />);
    expect(screen.getByRole('alert')).toHaveClass('govuk-error-summary');
  });

  it('It does render a sideBar when provided', () => {
    const sideBar = <p>SideBar</p>;
    render(
      <FlexibleQuestionPageLayout {...customProps} sideBarContent={sideBar} />
    );
    screen.getByText('SideBar');
  });
});
