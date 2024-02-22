import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CustomLink from './CustomLink';
import { merge } from 'lodash';

describe('Custom Link component', () => {
  const props = (overrides: any = {}) =>
    merge(
      {
        href: '/test',
        children: 'Test text',
        dataCy: 'Test data cy',
        ariaLabel: 'Test aria label',
        customStyle: 'Test custom style',
        dataTestId: 'Test custom data test id',
      },
      overrides
    );

  describe('Link', () => {
    it('Should render a link by default', () => {
      render(<CustomLink {...props()} />);
      screen.getByRole('link');
    });

    it('Should render a link with the provided href', () => {
      render(<CustomLink {...props()} />);
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/apply/admin/test'
      );
    });

    it('Should render a link with the provided dataCy prop', () => {
      render(<CustomLink {...props()} />);
      expect(screen.getByRole('link')).toHaveAttribute(
        'data-cy',
        'Test data cy'
      );
    });

    it('Should render a link with the provided ariaLabel prop', () => {
      render(<CustomLink {...props()} />);
      screen.getByRole('link', { name: 'Test aria label' });
    });

    it('Should render a link with a default ariaLabel prop', () => {
      render(<CustomLink {...props({ ariaLabel: '' })} />);
      screen.getByRole('link', { name: 'Test text' });
    });

    it('Should render a link with the provided custom style', () => {
      render(<CustomLink {...props()} />);
      expect(screen.getByRole('link')).toHaveClass('Test custom style');
    });

    it('Should render a link with the provided dataTestId', () => {
      render(<CustomLink {...props()} />);
      screen.getByTestId('Test custom data test id');
    });
  });

  describe('Button', () => {
    it('Should render a button when the isButton prop is true', () => {
      render(<CustomLink {...props({ isButton: true })} />);
      screen.getByRole('button');
    });

    it('Should render a secondary button when the isSecondaryButton prop is true', () => {
      render(<CustomLink {...props({ isSecondaryButton: true })} />);
      expect(screen.getByRole('button')).toHaveClass('govuk-button--secondary');
    });

    it('Should render a back button when the isBackButton prop is true', () => {
      render(<CustomLink {...props({ isBackButton: true, ariaLabel: '' })} />);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveClass(
        'govuk-back-link'
      );
    });

    it('Should default to being enabled', () => {
      render(<CustomLink {...props({ isButton: true })} />);
      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });

    it('Should be disabled when the disabled prop is true', () => {
      render(<CustomLink {...props({ isButton: true, disabled: true })} />);
      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });
  });
});
