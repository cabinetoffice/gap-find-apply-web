import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImportantBanner, { ImportantBannerProps } from './ImportantBanner';
import React from 'react';

const props: ImportantBannerProps = { bannerContent: 'Banner content text' };
const ImportantBannerComponent = () => {
  render(<ImportantBanner {...props} />);
};
describe('Important Banner Component', () => {
  beforeEach(() => {
    ImportantBannerComponent();
  });
  it('Should render banner content when provided', () => {
    expect(screen.getByText('Banner content text')).toHaveClass(
      'govuk-notification-banner__heading'
    );
  });

  it('Should render banner heading', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: 'Important' })
    ).toHaveClass('govuk-notification-banner__title');
  });
});
