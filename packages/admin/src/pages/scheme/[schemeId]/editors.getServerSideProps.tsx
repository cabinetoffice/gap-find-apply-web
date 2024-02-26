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

export type EditorList = {
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

  function formatEditorRows({ email: key, role: value, id }: EditorList) {
    const editorRow: UnformattedEditorRow = { key, value };
    if (isOwner)
      editorRow.action = {
        href: `/scheme/${schemeId}/manage-editors/remove/${id}`,
        label: 'Remove',
        ariaLabel: `Remove ${key}`,
      };
    return editorRow;
  }

  const editorRows = (
    await getSchemeEditors(schemeId, sessionCookie, userServiceJwt)
  ).map(formatEditorRows);

  editorRows.unshift({
    key: 'Email',
    value: 'Role',
    action: isOwner ? 'Actions' : '',
  } as UnformattedEditorRow);

  return {
    props: { schemeId, editorRows, schemeName },
  };
};

async function runGetEditorsAndHandleError(ctx: GetServerSidePropsContext) {
  try {
    return await getEditorsServerSideProps(ctx);
  } catch (error) {
    console.error('Error getting grant editors: ', error);

    const destination = `${
      process.env.SUB_PATH
    }/service-error?serviceErrorProps=${JSON.stringify({
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) =>
  runGetEditorsAndHandleError(ctx);
