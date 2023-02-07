import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ButtonType } from '../button/Button';
import { LinkType } from '../link/GovLink';
import { SaveAndCancel } from './SaveAndCancel';

const saveButton: ButtonType = {
  name: 'Save',
};
const cancelLink: LinkType = {
  text: 'Cancel',
  url: '/applicant/organisation',
  noVisitedState: true,
};

describe('Save and cancel component', () => {
  it('should display save button and cancel link', () => {
    render(<SaveAndCancel saveButton={saveButton} cancelLink={cancelLink} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /cancel/i })).toBeDefined();
  });

  it('should not display cancel link if not given', () => {
    render(<SaveAndCancel saveButton={saveButton} />);
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
