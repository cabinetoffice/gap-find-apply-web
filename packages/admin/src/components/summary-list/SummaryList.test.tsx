import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SummaryList from './SummaryList';
import SummaryListProps from './SummaryListType';

const customProps: SummaryListProps = {
  summaryListClassName: 'govuk-table__caption--m',
  summaryListAttributes: {
    ['data-cy']: 'cy-attribute',
  },
  rows: [
    {
      key: 'Name',
      value: 'Wominic Dest',
      action: {
        label: 'Change',
        href: '/edit/name',
      },
    },
    {
      key: 'Address',
      value: '123 Something Street',
      action: {
        label: 'Change',
        href: '/edit/address',
        ariaLabel: 'Change scheme address',
      },
    },
  ],
};

const component = <SummaryList {...customProps} />;

describe('Summary List component', () => {
  beforeEach(() => {
    render(component);
  });

  it('Applies a custom passed in summary list class name', () => {
    const rootSummaryListElement = screen.getByTestId('summary-list');
    expect(rootSummaryListElement).toHaveClass('govuk-table__caption--m');
  });

  it('Applies custom passed in summary list attributes', () => {
    const rootSummaryListElement = screen.getByTestId('summary-list');
    expect(rootSummaryListElement).toHaveAttribute('data-cy', 'cy-attribute');
  });

  it('Renders the row keys', () => {
    screen.getByText('Name');
    screen.getByText('Address');
  });

  it('Renders the row values', () => {
    screen.getByText('Wominic Dest');
    screen.getByText('123 Something Street');
  });

  it('Renders the row actions', () => {
    expect(screen.getByRole('link', { name: 'Change' })).toHaveAttribute(
      'href',
      '/apply/admin/edit/name'
    );
    expect(
      screen.getByRole('link', { name: 'Change scheme address' })
    ).toHaveAttribute('href', '/apply/admin/edit/address');
  });

  it('Should default the aria label to the action label', () => {
    expect(screen.getByRole('link', { name: 'Change' })).toHaveAttribute(
      'aria-label',
      'Change'
    );
  });

  it('Should set the passed in aria label', () => {
    expect(
      screen.getByRole('link', { name: 'Change scheme address' })
    ).toHaveAttribute('aria-label', 'Change scheme address');
  });
});
