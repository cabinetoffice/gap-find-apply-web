import { render, screen } from '@testing-library/react';
import { SearchBar } from './SearchBar';

const component = <SearchBar term={'Term'} searchHeading={'Search grants'} />;

describe('SearchBar component', () => {
  it('should render the initial text', () => {
    render(component);
    expect(
      screen.getByText(
        'Find government grants and check if you are eligible to apply.'
      )
    ).toBeDefined();
  });

  it('should render the input field with the default value Term', () => {
    render(component);
    expect(screen.getByRole('textbox', { name: 'Search grants' }).value).toBe(
      'Term'
    );
  });

  it('should render the input field without the input being pre-populated if no term is passed', () => {
    render(<SearchBar />);
    expect(screen.getByRole('textbox', { name: 'Search grants' }).value).toBe(
      ''
    );
  });

  it('should render the submit button with the correct message', () => {
    render(component);
    expect(screen.getByRole('button', { name: 'Search grants' })).toBeDefined();
  });
});
