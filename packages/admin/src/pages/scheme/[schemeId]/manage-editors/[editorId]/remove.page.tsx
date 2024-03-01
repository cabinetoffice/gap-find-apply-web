import { FlexibleQuestionPageLayout } from 'gap-web-ui';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../../utils/session';
import InferProps from '../../../../../types/InferProps';
import Meta from '../../../../../components/layout/Meta';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import {
  getSchemeEditors,
  removeEditor,
} from '../../../../../services/SchemeEditorService';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const schemeId = context.params?.schemeId as string;
  const editorId = context.params?.editorId as string;

  async function fetchPageData(jwt: string) {
    const editors = await getSchemeEditors(
      schemeId,
      jwt,
      getUserTokenFromCookies(context.req)
    );
    const editor = editors.find((editor) => editor.id == editorId)!;
    return {
      schemeId,
      editorEmail: editor.email,
    };
  }

  async function handleRequest(body: unknown, jwt: string) {
    return await removeEditor(jwt, schemeId, editorId);
  }

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getSessionIdFromCookies(context.req),
    onErrorMessage: 'Could not remove editors access.',
    onSuccessRedirectHref: `/scheme/${schemeId}/manage-editors`,
  });
}

export default function RemoveEditorPage({
  csrfToken,
  formAction,
  fieldErrors,
  pageData,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta title="Manage Editors - Remove Editor" />

      <Link
        href={`/scheme/${pageData.schemeId}/manage-editors`}
        className="govuk-back-link"
      >
        Back
      </Link>

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          csrfToken={csrfToken}
          formAction={formAction}
          fieldErrors={fieldErrors}
        >
          <span className="govuk-caption-l">{pageData.editorEmail}</span>

          <h1 className="govuk-heading-l">Remove editor</h1>

          <p className="govuk-body">
            If you remove {pageData.editorEmail} as an editor, they will no
            longer be able to view or edit the advert or application form for
            this grant.
          </p>

          <div className="govuk-button-group">
            <button
              type="submit"
              className="govuk-button govuk-button--warning"
            >
              Remove editor
            </button>

            <Link
              href={`/scheme/${pageData.schemeId}/manage-editors`}
              className="govuk-link"
            >
              Cancel
            </Link>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
}
