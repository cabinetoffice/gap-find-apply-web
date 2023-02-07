import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { PreviewDetailsTabContent } from './PreviewDetailsTabContent';
const props = {
  tabTitle: 'tabTitle',
  tabValue: 'tabValue',
  index: 0,
};

describe('PreviewDetailTabContent', () => {
  it('should display content', () => {
    render(<PreviewDetailsTabContent {...props} />);
    screen.getByRole('heading', { name: 'tabTitle' });
    screen.getByText(/tabvalue/i);
  });
  it('content div should have not class govuk-tabs__panel--hidden when index is 0', () => {
    render(<PreviewDetailsTabContent {...props} />);
    const div = screen.getByTestId('tabTitle-content-div');
    expect(div).not.toHaveClass('govuk-tabs__panel--hidden');
  });

  it('content div should have class govuk-tabs__panel--hidden when index is not 0', () => {
    render(<PreviewDetailsTabContent {...props} index={1} />);
    const div = screen.getByTestId('tabTitle-content-div');
    expect(div).toHaveClass('govuk-tabs__panel--hidden');
  });

  it('should not show the tabTitle and the tabValue if tabValue is falsy', () => {
    render(<PreviewDetailsTabContent {...props} tabValue="" />);
    expect(screen.queryByRole('heading', { name: 'Tab title' })).toBeFalsy();
    expect(screen.queryByText(/tabvalue/i)).toBeFalsy();
  });
});
