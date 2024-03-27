import { render, screen } from '@testing-library/react';
import { getPageProps } from '../../../../../testUtils/unitTestHelpers';
import InferProps from '../../../../../types/InferProps';
import RemoveEditorPage, { getServerSideProps } from './remove.page';
import { GetServerSidePropsContext } from 'next';
import {
  InferServiceMethodResponse,
  Optional,
  expectObjectEquals,
  getContext,
  mockServiceMethod,
} from 'gap-web-ui';
import InferGetServerSideProps from '../../../../../types/InferGetServerSideProps';
import {
  getSchemeEditors,
  removeEditor,
} from '../../../../../services/SchemeEditorService';
import { parseBody } from '../../../../../utils/parseBody';

jest.mock('../../../../../services/SchemeEditorService');
jest.mock('../../../../../utils/parseBody');

const mockedGetSchemeEditors = jest.mocked(getSchemeEditors);
const mockedRemoveEditor = jest.mocked(removeEditor);
const mockedParseBody = jest.mocked(parseBody);

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

  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        schemeId: 'testSchemeId',
        editorId: 'testEditorId',
      },
    });

    const getDefaultSchemeEditors = (): InferServiceMethodResponse<
      typeof getSchemeEditors
    > => [{ id: 'testEditorId', email: 'testEditorEmail', role: 'EDITOR' }];

    type Props = InferGetServerSideProps<typeof getServerSideProps>;

    beforeEach(() => {
      mockServiceMethod(mockedGetSchemeEditors, getDefaultSchemeEditors);
      mockedParseBody.mockResolvedValue({});
    });

    it('Should fetch relevant page data', async () => {
      const response = (await getServerSideProps(
        getContext(getDefaultContext)
      )) as Props;

      expectObjectEquals(response, {
        props: {
          csrfToken: 'some-csrf-token',
          fieldErrors: [],
          formAction: '/apply/admin/testResolvedURL',
          previousValues: null,
          pageData: {
            editorEmail: 'testEditorEmail',
            schemeId: 'testSchemeId',
          },
        },
      });
    });

    it('Should call the removeEditor service method', async () => {
      await getServerSideProps(
        getContext(getDefaultContext, {
          req: {
            method: 'POST',
          },
        })
      );

      expect(mockedRemoveEditor).toHaveBeenNthCalledWith(
        1,
        'testSessionId',
        'testSchemeId',
        'testEditorId'
      );
    });

    it('Should render service error page upon an error fetching data', async () => {
      mockedGetSchemeEditors.mockRejectedValue(new Error());

      const response = await getServerSideProps(getContext(getDefaultContext));

      if ('props' in response) throw new Error('Should not return props');

      expect(response.redirect).toEqual(
        expect.objectContaining({
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to load this page.","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}`,
        })
      );
    });

    it('Should render service error page upon an error removing an editor', async () => {
      mockedRemoveEditor.mockRejectedValue(new Error());

      const response = await getServerSideProps(
        getContext(getDefaultContext, {
          req: {
            method: 'POST',
          },
        })
      );

      if ('props' in response) throw new Error('Should not return props');

      expect(response.redirect).toEqual(
        expect.objectContaining({
          destination: `/service-error?serviceErrorProps={"errorInformation":"Could not remove editors access.","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}`,
        })
      );
    });
  });
});
