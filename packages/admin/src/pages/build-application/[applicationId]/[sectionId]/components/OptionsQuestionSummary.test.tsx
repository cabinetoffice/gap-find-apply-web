import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import OptionsQuestionSummary from './OptionsQuestionSummary';

describe('Question Summary', () => {
  const getProps = (overrides: any = {}) =>
    merge(
      {
        fieldTitle: 'Question Name',
        hintText: 'This is a test question summary',
        optional: 'true',
        responseType: 'Dropdown',
      },
      overrides
    );

  const component = <OptionsQuestionSummary questionSummary={getProps()} />;

  it('Should render the question title', () => {
    render(component);
    screen.getByRole('heading', { name: 'Question Name' });
  });

  it('Should render the question hint if one is present', () => {
    render(component);
    screen.getByText('This is a test question summary');
  });

  it('Shouldnt render the question hint if one is present', () => {
    render(
      <OptionsQuestionSummary questionSummary={getProps({ hintText: '' })} />
    );
    expect(screen.queryByTestId('summary-hint-text')).toBeNull();
  });

  it('Should render the dropdown question description when response type is dropdown', () => {
    render(component);
    screen.getByText(
      'You must enter at least two options. Applicants will only be able to choose one answer.'
    );
  });

  it('Should render the MultipleSelection question description when response type is MultipleSelection', () => {
    render(
      <OptionsQuestionSummary
        questionSummary={getProps({ responseType: 'MultipleSelection' })}
      />
    );
    screen.getByText(
      'You must enter at least two options. Applicants will be able to choose one or more answers.'
    );
  });
});
