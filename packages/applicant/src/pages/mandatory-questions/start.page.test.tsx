import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MandatoryQuestionsBeforeYouStart, {
  MandatoryQuestionsProps,
} from './start.page';
import { getProps } from 'gap-web-ui';

function getDefaultProps(): MandatoryQuestionsProps {
  return {
    schemeId: '1',
  };
}

describe('Mandatory Questions Start', () => {
  test('should render page', () => {
    render(<MandatoryQuestionsBeforeYouStart {...getProps(getDefaultProps)} />);

    screen.getByRole('heading', {
      name: 'Before you start',
    });
    screen.getByRole('paragraph', {
      name: 'Before you start, we’d like to ask you a few questions.',
    });
    screen.getByRole('paragraph', {
      name:
        'These questions will be used by the grant’s administrators to prevent fraud ' +
        'and help Find a grant understand the demand for this grant.',
    });
    screen.getByRole('paragraph', {
      name: 'You will need:',
    });
    screen.getByRole('listitem', {
      name: 'your organisation’s address',
    });
    screen.getByRole('listitem', {
      name: 'your Companies House number (if you have one)',
    });
    screen.getByRole('listitem', {
      name: 'your Charity Commission number (if you have one)',
    });
    screen.getByRole('button', {
      name: 'Continue',
    });
  });
});
