import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { PreviewSideBar } from './PreviewSideBar';
const props = {
  schemeId: 'test-scheme-id',
  advertId: 'test-advert-id',
};

describe('PreviewDetailTabContent', () => {
  beforeEach(() => {
    render(<PreviewSideBar {...props} />);
  });
  it('should display content', () => {
    screen.getByRole('heading', {
      name: /preview your advert/i,
    });
    screen.getByText(
      /See how your advert will appear to applicants on Find a grant\./i
    );
    screen.getByRole('link', {
      name: /preview my advert/i,
    });
    screen.getByTestId('preview-side-bar-top');
    screen.getByTestId('preview-side-bar-bottom');
  });

  it('should have the right href to the preview page', () => {
    const link = screen.getByRole('link', {
      name: /preview my advert/i,
    });
    expect(link).toHaveAttribute(
      'href',
      `/apply/admin/scheme/${props.schemeId}/advert/${props.advertId}/preview`
    );
  });
});
