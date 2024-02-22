import '@testing-library/jest-dom';
import Integrations, { Integration } from './index.page';
import { render, screen } from '@testing-library/react';

jest.mock('./Navigation');

const getProps = ({ isConnected }: { isConnected: boolean }) => ({
  integrations: [
    {
      name: 'Test Integration',
      status: isConnected ? 'Connected' : 'FAILURE',
      timestamp: '2003-01-01T00:00:00.000Z',
      connectionUrl: 'https://example.com',
    },
  ] as Integration[],
});

const getConnectionCellInFirstRow = () =>
  document.querySelector(
    '[data-cy="cy_table_row-for-Connection-row-0-cell-3"]'
  );

describe('Integrations page', () => {
  it('renders formatted data with integration status "connected"', () => {
    render(<Integrations {...getProps({ isConnected: true })} />);

    expect(screen.getByText('01 January 2003')).toBeVisible();
    expect(screen.getByText('Connected')).toBeVisible();
    expect(getConnectionCellInFirstRow()).toHaveTextContent('-');
  });

  it('renders formatted data with integration status "disconnected"', () => {
    render(<Integrations {...getProps({ isConnected: false })} />);

    expect(screen.getByText('01 January 2003')).toBeVisible();
    expect(screen.queryByText('Disconnected')).toBeVisible();
    expect(getConnectionCellInFirstRow()).toHaveTextContent('Reconnect');
  });
});
