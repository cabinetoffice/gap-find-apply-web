import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../utils/session';
import {
  EditorList,
  getSchemeEditors,
  isSchemeOwner,
} from '../../../services/SchemeEditorService';
import { getGrantScheme } from '../../../services/SchemeService';

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

type GetEditorRowsProps = {
  isOwner: boolean;
  schemeId: string;
  sessionCookie: string;
  userServiceJwt: string;
};

const getEditorRows = async ({
  isOwner,
  schemeId,
  sessionCookie,
  userServiceJwt,
}: GetEditorRowsProps) => {
  function addOwnerAction({ email: key, role: value, id }: EditorList) {
    const editorRow: UnformattedEditorRow = { key, value };
    if (isOwner)
      editorRow.action = {
        href: `/scheme/${schemeId}/manage-editors/remove/${id}`,
        label: 'Remove',
        ariaLabel: `Remove ${key}`,
      };
    return editorRow;
  }

  const schemeEditors = await getSchemeEditors(
    schemeId,
    sessionCookie,
    userServiceJwt
  );

  const tableHeadingRow: UnformattedEditorRow = {
    key: 'Email',
    value: 'Role',
    action: isOwner ? 'Actions' : '',
  };

  return [tableHeadingRow, ...schemeEditors.map(addOwnerAction)];
};

const getEditorsServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);
  const userServiceJwt = getUserTokenFromCookies(req);

  const isOwner = await isSchemeOwner(schemeId, sessionCookie);

  const { name: schemeName } = await getGrantScheme(schemeId, sessionCookie);

  if (!isOwner && req.url?.includes('manage-editors'))
    return {
      redirect: {
        permanent: true,
        destination: `/scheme/${schemeId}`,
      },
    };

  return {
    props: {
      schemeId,
      editorRows: await getEditorRows({
        isOwner,
        schemeId,
        sessionCookie,
        userServiceJwt,
      }),
      schemeName,
    },
  };
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    return await getEditorsServerSideProps(ctx);
  } catch (error) {
    console.error('Error getting grant editors: ', error);

    const destination = `/service-error?serviceErrorProps=${JSON.stringify({
      errorInformation:
        'Something went wrong while trying to contact the server.',
      linkAttributes: {
        href: ctx.params?.schemeId
          ? `/scheme/${ctx.params?.schemeId}/`
          : undefined,
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    })}`;

    return {
      redirect: {
        permanent: true,
        destination,
      },
    };
  }
}
