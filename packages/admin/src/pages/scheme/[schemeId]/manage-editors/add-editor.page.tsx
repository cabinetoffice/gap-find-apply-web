import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../utils/session';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import { addSchemeEditor } from '../../../../services/SchemeEditorService';
import { getGrantScheme } from '../../../../services/SchemeService';

type PageBodyResponse = {
  editorEmailAddress: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { schemeId } = context.params as Record<string, string>;

  const schemeName = context.query.schemeName
    ? decodeURIComponent(context.query.schemeName as string)
    : await getGrantScheme(schemeId, getSessionIdFromCookies(context.req)).then(
        (scheme) => scheme.name
      );

  const newEmailAddress = context.query.newEmailAddress
    ? decodeURIComponent(context.query.newEmailAddress as string)
    : null;

  async function handleRequest(
    { editorEmailAddress }: PageBodyResponse,
    jwt: string
  ) {
    await addSchemeEditor(
      schemeId,
      jwt,
      getUserTokenFromCookies(context.req),
      editorEmailAddress
    );
    return editorEmailAddress;
  }

  async function fetchPageData() {
    return {
      schemeName,
      schemeId: schemeId,
      editorEmailAddress: newEmailAddress,
    };
  }

  return QuestionPageGetServerSideProps<
    PageBodyResponse,
    Awaited<ReturnType<typeof fetchPageData>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getSessionIdFromCookies(context.req),
    onErrorMessage: 'Failed adding new editor.',
    onSuccessRedirectHref: (editorEmailAddress) => {
      return `/scheme/${schemeId}/manage-editors?newEditor=${editorEmailAddress}`;
    },
  });
}

const AddEditorPage = ({
  fieldErrors,
  formAction,
  csrfToken,
  pageData,
  previousValues,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Manage Editors - Add an Editor`}
      />

      <CustomLink
        isBackButton
        href={`/scheme/${pageData.schemeId}/manage-editors`}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <span className="govuk-caption-xl">{pageData.schemeName}</span>
          <h1 className="govuk-heading-l">Add a new editor</h1>

          <h2 className="govuk-heading-m">
            Enter the email address of editor you would like to add.
          </h2>
          <p className="govuk-body">
            Only those with an &apos;Administrator&apos; account can edit a
            grant.
          </p>

          <TextInput
            fieldName="editorEmailAddress"
            fieldErrors={fieldErrors}
            defaultValue={previousValues?.editorEmailAddress ?? undefined}
            textInputSubtype="email"
          />

          <Button text="Confirm" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default AddEditorPage;
