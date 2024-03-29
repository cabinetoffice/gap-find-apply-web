import { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from './editors.getServerSideProps';
import * as sessionUtils from '../../../utils/session';
import { getGrantScheme } from '../../../services/SchemeService';
import {
  getSchemeEditors,
  isSchemeOwner,
} from '../../../services/SchemeEditorService';

const mockGetServerSidePropsContext = (params = {}, req = {}, query = {}) =>
  ({
    params,
    req,
    query,
  } as unknown as GetServerSidePropsContext);

jest.mock('../../../utils/session');
jest.mock('../../../services/SchemeService');
jest.mock('../../../services/SchemeEditorService');

const mockSessionUtils = jest.mocked(sessionUtils);

describe('getEditorsServerSideProps', () => {
  beforeEach(() => {
    mockSessionUtils.getSessionIdFromCookies.mockReturnValue('testSessionId');
    mockSessionUtils.getUserTokenFromCookies.mockReturnValue('testJwt');
    (getGrantScheme as jest.Mock).mockReturnValue({ name: 'Test Scheme' });
  });

  test('returns props object when user is owner and request is not for managing editors', async () => {
    (getSchemeEditors as jest.Mock).mockReturnValue([
      {
        role: 'OWNER',
        id: 'ownerId',
        email: 'owner@example.com',
      },
    ]);
    (isSchemeOwner as jest.Mock).mockReturnValue(true);
    const ctx = mockGetServerSidePropsContext({ schemeId: 'testSchemeId' });
    const result = await getServerSideProps(ctx);
    expect(result).toEqual({
      props: {
        schemeId: 'testSchemeId',
        editorRows: [
          { key: 'Email', value: 'Role', action: 'Actions' },
          {
            key: 'owner@example.com',
            value: 'OWNER',
            action: {
              href: '/scheme/testSchemeId/manage-editors/ownerId/remove',
              label: 'Remove',
              ariaLabel: 'Remove owner@example.com',
            },
          },
        ],
        schemeName: 'Test Scheme',
        newEditor: null,
      },
    });
  });

  test('returns redirect object when user is not owner and request is for managing editors', async () => {
    (isSchemeOwner as jest.Mock).mockReturnValue(false);
    const ctx = mockGetServerSidePropsContext(
      { schemeId: 'testSchemeId' },
      { url: '/scheme/testSchemeId/manage-editors' }
    );
    const result = await getServerSideProps(ctx);
    expect(result).toEqual({
      redirect: {
        permanent: true,
        destination: '/scheme/testSchemeId',
      },
    });
  });
});
