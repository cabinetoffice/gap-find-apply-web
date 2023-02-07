import { render, screen } from '@testing-library/react';
import { SearchInputBar } from './SearchInputBar';

const component = (
  <SearchInputBar
    dataCy={'test'}
    searchTerm={'term'}
    id={'searchAgainTermInput'}
  />
);

describe('SearchInputBar component', () => {
  it('should render an input bar with the fixed parameters', () => {
    render(component);
    const textbox = screen.getByRole('textbox', { name: '' });
    expect(textbox.getAttribute('id')).toBe('searchAgainTermInput');
    expect(textbox.getAttribute('class')).toBe('govuk-input');
    expect(textbox.getAttribute('name')).toBe('searchTerm');
    expect(textbox.getAttribute('placeholder')).toBe(
      'enter a keyword or search term here'
    );
  });

  it('should render an input bar with the passed in props', () => {
    render(component);
    const textbox = screen.getByRole('textbox', { name: '' });
    expect(textbox.getAttribute('data-cy')).toBe('test');
    expect(textbox.getAttribute('value')).toBe('term');
  });
});
