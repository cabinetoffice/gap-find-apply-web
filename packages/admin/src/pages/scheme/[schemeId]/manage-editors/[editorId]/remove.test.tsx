import { render, screen } from '@testing-library/react';
import { getPageProps } from '../../../../../testUtils/unitTestHelpers';
import InferProps from '../../../../../types/InferProps';
import RemoveEditorPage, { getServerSideProps } from './remove.page';

describe('Manage editors - remove an editor', () => {
  describe('UI', () => {
    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      pageData: {
        schemeId: 'testSchemeId',
        editorEmail: 'test@gmail.com',
      },
      csrfToken: 'testCsrfToken',
      formAction: 'testFormAction',
      fieldErrors: [],
      previousValues: {},
      isEdit: false,
    });

    it('Should render a back button', () => {
      render(<RemoveEditorPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/scheme/testSchemeId/manage-editors'
      );
    });

    it("Should render the editor to be removed's email", () => {
      render(<RemoveEditorPage {...getPageProps(getDefaultProps)} />);

      screen.getByText('test@gmail.com');
      screen.getByText('If you remove test@gmail.com as an editor', {
        exact: false,
      });
    });

    it('Should render a "Remove editor" button', () => {
      render(<RemoveEditorPage {...getPageProps(getDefaultProps)} />);

      screen.getByRole('button', { name: 'Remove editor' });
    });

    it('Should render a cancel button', () => {
      render(<RemoveEditorPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute(
        'href',
        '/scheme/testSchemeId/manage-editors'
      );
    });
  });
});
