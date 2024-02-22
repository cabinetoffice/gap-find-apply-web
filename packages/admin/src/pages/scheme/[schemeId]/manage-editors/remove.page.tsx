import { FlexibleQuestionPageLayout } from 'gap-web-ui';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import { getUserTokenFromCookies } from '../../../../utils/session';
import InferProps from '../../../../types/InferProps';
import Meta from '../../../../components/layout/Meta';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const schemeId = context.params?.schemeId as string;
  const editorName = context.query?.editorName as string;

  async function fetchPageData() {
    return {
      schemeId,
      editorName,
    };
  }

  async function handleRequest() {}

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'ruh roh',
    onSuccessRedirectHref: `/scheme/${schemeId}/manager-editors`,
    isEdit: false, //TODO FIX THIS
  });
};

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
        href={`/scheme/${pageData.schemeId}/manager-editors`}
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
          <span className="govuk-caption-l">{pageData.editorName}</span>

          <h1 className="govuk-heading-l">Remove editor</h1>

          <p className="govuk-body">
            If you remove {pageData.editorName} as an editor, they will no
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
              href={`/scheme/${pageData.schemeId}/manager-editors`}
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
