import { render, screen } from '@testing-library/react';
import { Optional, getContext, mockServiceMethod } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import InferProps from '../../../../types/InferProps';
import AddEditorPage, { getServerSideProps } from './add-editor.page';
import { getPageProps } from '../../../../testUtils/unitTestHelpers';
import { addSchemeEditor } from '../../../../services/SchemeService';
import { parseBody } from '../../../../utils/parseBody';

jest.mock('../../../../services/SchemeService');
jest.mock('../../../../utils/parseBody');

describe('Manage Editors - Add an Editor', () => {
  describe('UI', () => {
    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      pageData: {
        schemeName: 'Test Scheme',
        schemeId: 'testSchemeId',
        editorEmailAddress: null,
      },
      previousValues: { editorEmailAddress: '' },
      csrfToken: 'csrfToken',
      formAction: '/test',
      fieldErrors: [],
    });

    it('Should render a title tag', () => {
      render(<AddEditorPage {...getPageProps(getDefaultProps)} />);

      expect(document.title).toBe('Manage Editors - Add an Editor');
    });

    it('Should render a title tag with Error when there are validation errors', () => {
      render(
        <AddEditorPage
          {...getPageProps(getDefaultProps, {
            fieldErrors: [
              {
                fieldName: 'editorEmailAddress',
                errorMessage: 'Please enter an email',
              },
            ],
          })}
        />
      );

      expect(document.title).toBe('Error: Manage Editors - Add an Editor');
    });

    it('Should render a back button', () => {
      render(<AddEditorPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/scheme/testSchemeId/manage-editors'
      );
    });

    it('Should render the scheme name', () => {
      render(<AddEditorPage {...getPageProps(getDefaultProps)} />);

      screen.getByText('Test Scheme');
    });

    it('Should render a text input', () => {
      render(<AddEditorPage {...getPageProps(getDefaultProps)} />);

      expect(
        screen.getByRole('textbox', { fieldName: 'editorEmailAddress' })
      ).toHaveValue('');
    });

    it('The text input should default to previousValue if it exists', () => {
      render(
        <AddEditorPage
          {...getPageProps(getDefaultProps, {
            previousValues: { editorEmailAddress: 'test@gmail.com' },
          })}
        />
      );

      expect(
        screen.getByRole('textbox', { fieldName: 'editorEmailAddress' })
      ).toHaveValue('test@gmail.com');
    });
  });

  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        schemeId: 'testSchemeId',
        schemeName: 'Test Scheme',
      },
      query: {
        schemeName: 'Test Scheme',
      },
      req: {
        cookies: {
          'user-service-token': 'jwt',
          sessionId: 'testSessionId',
        },
      },
      res: { getHeader: () => 'testCSRFToken' },
    });

    const mockedAddSchemeEditor = jest.mocked(addSchemeEditor);
    const mockedParseBody = jest.mocked(parseBody);

    beforeEach(() => {
      mockServiceMethod(mockedAddSchemeEditor, () => true);
      mockedParseBody.mockResolvedValue({
        editorEmailAddress: 'test@test.gov',
      });
    });

    it('Should fetch the grant scheme', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(result.props.pageData).toEqual(
        expect.objectContaining({
          schemeName: 'Test Scheme',
          schemeId: 'testSchemeId',
          editorEmailAddress: null,
        })
      );
    });

    it('Should add the new editor', async () => {
      const result = await getServerSideProps(
        getContext(getDefaultContext, { req: { method: 'POST' } })
      );

      if ('props' in result) throw new Error('Should not return props');

      expect(mockedAddSchemeEditor).toHaveBeenCalledWith(
        'testSchemeId',
        'testSessionId',
        'jwt',
        'test@test.gov'
      );
      expect(result.redirect).toEqual(
        expect.objectContaining({
          destination:
            '/scheme/testSchemeId/manage-editors?newEditor=test@test.gov',
        })
      );
    });
  });
});
