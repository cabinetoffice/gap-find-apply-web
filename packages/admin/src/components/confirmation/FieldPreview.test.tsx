import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FieldPreview from './FieldPreview';

const componentProps = {
  name: 'Test Field',
  value: 'This is my test value.',
  linkAttributes: {
    href: '/test',
    text: 'Test link text',
  },
  marginTop: 5,
};

const component = <FieldPreview {...componentProps} />;

describe('FieldPreview page render', () => {
  it('Should render the field name as a h2 header', () => {
    render(component);
    screen.getByRole('heading', { name: 'Test Field' });
  });

  it('Should render the fields value', () => {
    render(component);
    screen.getByText('This is my test value.');
  });

  it('Should render a link with link attributes provided', () => {
    render(component);
    const link = screen.getByRole('link', { name: 'Test link text' });
    expect(link).toHaveAttribute('href', '/apply/test');
  });

  it('Should add GDS responsive spacing to the field preview when provided', () => {
    render(component);
    const header = screen.getByRole('heading', { name: 'Test Field' });
    expect(header).toHaveClass('govuk-!-margin-top-5');
  });

  it('Shouldnt add link when no linkAttributes are provided', () => {
    const { linkAttributes: _, ...componentPropsWithoutLinkAttributes } =
      componentProps;
    render(<FieldPreview {...componentPropsWithoutLinkAttributes} />);
    const link = screen.queryByRole('link');
    expect(link).toBeNull();
  });
});
