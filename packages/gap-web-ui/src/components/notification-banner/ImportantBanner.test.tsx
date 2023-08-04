import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImportantBanner, { ImportantBannerProps } from './ImportantBanner';
import React from 'react';
import { getProps } from '../../utils';

describe('Important Banner Component', () => {
  function getDefaultProps(): ImportantBannerProps {
    return {
      bannerHeading: 'Banner content text',
    };
  }

  it('Should render banner content when provided', () => {
    render(<ImportantBanner {...getProps(getDefaultProps)} />);

    expect(screen.getByText('Banner content text')).toHaveClass(
      'govuk-notification-banner__heading'
    );
  });

  it('Should render banner heading', () => {
    render(<ImportantBanner {...getProps(getDefaultProps)} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Important' })
    ).toHaveClass('govuk-notification-banner__title');
  });

  it('Should render success banner', () => {
    render(
      <ImportantBanner
        {...getProps(getDefaultProps, { successBanner: true })}
      />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Success' })
    ).toHaveClass('govuk-notification-banner__title');
  });

  it('Should render banner content', () => {
    render(
      <ImportantBanner
        {...getProps(getDefaultProps, { bannerContent: 'Banner content' })}
      />
    );

    screen.getByText('Banner content');
  });
});
