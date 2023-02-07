import { render, screen } from '@testing-library/react';
import { SearchForm } from './SearchForm';

const component = (
  <SearchForm searchTerm={'Term'} searchHeading={'Search grants'} />
);

describe('SearchBar component', () => {
  it('should render the initial text', () => {
    render(component);
    expect(screen.getByText('Search grants')).toBeDefined();
  });

  it('should render the input field with the default value Term', () => {
    render(component);
    expect(screen.getByRole('textbox', { name: 'Search grants' }).value).toBe(
      'Term'
    );
  });

  it('should render the input field without the input being pre-populated if no term is passed', () => {
    render(<SearchForm searchHeading={'Search grants'} />);
    expect(screen.getByRole('textbox', { name: 'Search grants' }).value).toBe(
      ''
    );
  });

  it('should render the submit button with the correct message', () => {
    render(component);
    expect(screen.getByRole('button', { name: 'Search' })).toBeDefined();
  });
});
