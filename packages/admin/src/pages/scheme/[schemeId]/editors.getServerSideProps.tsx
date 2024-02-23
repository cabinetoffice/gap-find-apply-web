import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../utils/session';
import {
  getGrantScheme,
  getSchemeEditors,
  isSchemeOwner,
} from '../../../services/SchemeService';

type EditorList = {
  role: 'EDITOR' | 'OWNER';
  email: string;
  id: string;
};

export type Action = {
  href: string;
  label: string;
  ariaLabel: string;
};

export type UnformattedEditorRow = {
  key: string;
  value: string;
  action?: string | Action | JSX.Element;
};

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);
  const userServiceJwt = getUserTokenFromCookies(req);
  const isOwner = await isSchemeOwner(schemeId, sessionCookie);
  const { name: schemeName } = await getGrantScheme(schemeId, sessionCookie);
  // const isOwner = true;

  if (!isOwner && req.url?.includes('manage-editors'))
    return {
      redirect: {
        destination: `/scheme/${schemeId}`,
        permanent: true,
      },
    };

  // const realEditors = await getSchemeEditors(
  //   schemeId,
  //   sessionCookie,
  //   userServiceJwt
  // );

  const editors: EditorList[] = [
    {
      role: 'OWNER',
      email: 'test.owner@grants.com',
      id: '1',
    },
    {
      id: '2',
      role: 'EDITOR',
      email: 'test-editor@grants.com',
    },
    {
      id: '3',
      role: 'EDITOR',
      email: 'test-editor@grants.com',
    },
  ];

  const editorRows = editors.map(({ email, role, id }, idx) => {
    const editorRow: UnformattedEditorRow = {
      key: email,
      value: role,
    };

    if (isOwner) {
      editorRow.action = {
        href: `/scheme/${schemeId}/manage-editors/remove/${id}`,
        label: 'Remove',
        ariaLabel: `Remove ${email}`,
      };
    }

    return editorRow;
  });

  const headingRow: UnformattedEditorRow = {
    key: 'Email',
    value: 'Role',
    action: isOwner ? 'Actions' : '',
  };

  editorRows.unshift(headingRow);
  return {
    props: { schemeId, editorRows, schemeName },
  };
};
