import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  test('should display ', () => {
    render(
      <Card
        link={'/dummy'}
        linkDescription={'test link'}
        description={'test description'}
      />
    );
    const linkDescription = screen.getByText(/test link/i);
    const description = screen.getByText(/test description/i);
    const link = linkDescription.getAttribute('href');

    expect(linkDescription).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(link).toBe('/dummy');
  });
});
