import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { PreviewDetailsTabHeader } from './PreviewDetailsTabHeader';

const props = {
  tabTitle: 'title',
  index: 0,
};

describe('PreviewDetailsTabItem', () => {
  it('should display the right link href', async () => {
    render(<PreviewDetailsTabHeader {...props} />);
    const link = screen.getByRole('link', {
      name: /title/i,
    });
    expect(link).toHaveAttribute('href', '#title');
  });

  it('should have the selected class when index is 0', () => {
    render(<PreviewDetailsTabHeader {...props} />);
    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveClass('govuk-tabs__list-item--selected');
  });

  it('should have not the selected class when index is not 0', () => {
    render(<PreviewDetailsTabHeader {...props} index={1} />);
    const listItem = screen.getByRole('listitem');
    expect(listItem).not.toHaveClass('govuk-tabs__list-item--selected');
  });
});
