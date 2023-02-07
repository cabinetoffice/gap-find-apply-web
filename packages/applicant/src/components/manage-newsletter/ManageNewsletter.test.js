import { render, screen } from '@testing-library/react';
import { ManageNewsletter } from './ManageNewsletter';
import '@testing-library/jest-dom';
import { formatDateTimeForSentence } from '../../../src/utils/dateFormatterGDS';
import { newsletterRoutes } from '../../utils/constants';

jest.mock('../../../src/utils/dateFormatterGDS');

const unsubscribeLinkText = 'Unsubscribe from updates about new grants';

describe('<ManageNewsletter />', () => {
  const signupDate = Date.parse('2022-05-04T13:01:07Z');
  const mockDateParams = {
    from: { day: 9, month: 3, year: 2022 },
    to: { day: 16, month: 3, year: 2022 },
  };

  it('should display the date that a user signed up', () => {
    formatDateTimeForSentence.mockReturnValue('4 May 2022 at 1.01pm');
    render(
      <ManageNewsletter
        signupDate={signupDate}
        newGrantsDateParams={mockDateParams}
      />
    );

    expect(
      screen.getByText('You signed up for updates on 4 May 2022 at 1.01pm.')
    ).toBeDefined();
  });

  it('should display a clickable link to unsubscribe', () => {
    formatDateTimeForSentence.mockReturnValue('4 May 2022 at 1.01pm');
    render(
      <ManageNewsletter
        signupDate={signupDate}
        subscriptionId={1}
        newGrantsDateParams={mockDateParams}
      />
    );

    expect(screen.getByText(unsubscribeLinkText)).toHaveAttribute(
      'href',
      `${newsletterRoutes.unsubscribe}/1`
    );
  });

  it('should display button which views to new grants page', () => {
    render(
      <ManageNewsletter
        signupDate={signupDate}
        newGrantsDateParams={mockDateParams}
      />
    );
    const newGrantsButton = screen.getByRole('button', {
      name: 'View Updates',
    });
    expect(newGrantsButton).toBeDefined();
    expect(newGrantsButton.closest('form')).toHaveAttribute(
      'action',
      '/grants'
    );

    expect(screen.getByTestId('from-day')).toHaveValue('9');
    expect(screen.getByTestId('from-month')).toHaveValue('3');
    expect(screen.getByTestId('from-year')).toHaveValue('2022');
    expect(screen.getByTestId('to-day')).toHaveValue('16');
    expect(screen.getByTestId('to-month')).toHaveValue('3');
    expect(screen.getByTestId('to-year')).toHaveValue('2022');
  });
});
