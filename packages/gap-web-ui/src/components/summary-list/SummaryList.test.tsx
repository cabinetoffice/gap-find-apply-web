import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SummaryList, { SummaryListProps } from './SummaryList';

const customProps: SummaryListProps = {
  summaryListAttributes: {
    ['data-cy']: 'cy-attribute',
  },
  rows: [
    {
      key: 'Name',
      value: 'Wominic Dest',
      action: (
        <a className="govuk-link" href="/edit/name">
          Change
        </a>
      ),
    },
    {
      key: 'Address',
      value: '123 Something Street',
      action: (
        <a
          className="govuk-link"
          href="/edit/address"
          aria-label="Change scheme address"
        >
          Change
        </a>
      ),
    },
  ],
};

const component = <SummaryList {...customProps} />;

describe('Summary List component', () => {
  beforeEach(() => {
    render(component);
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
      '/edit/name'
    );
    expect(
      screen.getByRole('link', { name: 'Change scheme address' })
    ).toHaveAttribute('href', '/edit/address');
  });

  it('Should set the passed in aria label', () => {
    expect(
      screen.getByRole('link', { name: 'Change scheme address' })
    ).toHaveAttribute('aria-label', 'Change scheme address');
  });
});
