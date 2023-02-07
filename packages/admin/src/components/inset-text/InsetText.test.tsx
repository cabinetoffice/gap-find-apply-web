import '@testing-library/jest-dom';
import InsetText from './InsetText';
import { render, screen } from '@testing-library/react';

describe('InsetText component', () => {
  const renderComponent = () => {
    render(
      <InsetText>
        <h1>Test!</h1>
      </InsetText>
    );
  };
  it('Should render a single div with the correct className', () => {
    renderComponent();
    expect(screen.getByTestId('inset-text')).toHaveClass('govuk-inset-text');
  });

  it('Should render the passed in children', () => {
    renderComponent();
    screen.getByRole('heading', { name: 'Test!', level: 1 });
  });
});
