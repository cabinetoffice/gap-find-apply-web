import { render, screen } from '@testing-library/react';
import RelatedContent from '../../src/components/related-content';
import '@testing-library/jest-dom/extend-expect';

const component = (
  <RelatedContent
    links={[
      { title: 'About us', href: '/info/about-us' },
      { title: 'Privacy notice', href: '/info/privacy' },
    ]}
  />
);

describe('Rendering the related content component', () => {
  it('Should render related content header', () => {
    render(component);
    expect(screen.getByText('Related content')).toBeDefined();
  });

  it('Should render the about us link', () => {
    render(component);
    expect(screen.getByText('About us')).toBeDefined();
    expect(screen.getByText('About us')).toHaveAttribute(
      'href',
      '/info/about-us'
    );
  });

  it('Should render the privacy link', () => {
    render(component);
    expect(screen.getByText('Privacy notice')).toBeDefined();
    expect(screen.getByText('Privacy notice')).toHaveAttribute(
      'href',
      '/info/privacy'
    );
  });

  it('Should render custom header if provided', () => {
    render(<RelatedContent title="Custom title" links={[]} />);
    expect(screen.getByRole('heading', { name: 'Custom title' })).toBeDefined();
  });
});
