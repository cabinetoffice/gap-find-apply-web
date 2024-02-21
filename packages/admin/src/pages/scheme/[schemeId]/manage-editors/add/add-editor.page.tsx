import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import InferProps from '../../../../../types/InferProps';
import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../../utils/session';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';
import { addSchemeEditor } from '../../../../../services/SchemeService';

type PageBodyResponse = {
  emailAddress: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { schemeId } = context.params as Record<string, string>;
  const oldEmailAddress = decodeURIComponent(
    context.query.oldEmailAddress as string
  );
  const newEmailAddress = context.query.newEmailAddress
    ? decodeURIComponent(context.query.newEmailAddress as string)
    : null;
  const schemeName = decodeURIComponent(context.query.schemeName as string);

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    await addSchemeEditor(
      schemeId,
      jwt,
      getUserTokenFromCookies(context.req),
      body.emailAddress
    );
    return body.emailAddress;
  }

  async function fetchPageData() {
    return {
      schemeName,
      prevEmailAddress: newEmailAddress,
      schemeId: schemeId ?? null,
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
    onErrorMessage: 'Failed add new editor.',
    onSuccessRedirectHref: (newEmailAddress) => {
      const queryParams = new URLSearchParams({
        newEmailAddress,
        oldEmailAddress,
      }).toString();
      return `/schemes/${schemeId}/manage-editors/add-editor?${queryParams}`;
    },
  });
}

const ChangeOwnerPage = ({
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
        }Manage Editors - Change Scheme Owner`}
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
            Only those with an &aposAdministrator&apos account can edit a grant.
          </p>

          <TextInput
            fieldName="emailAddress"
            fieldErrors={fieldErrors}
            defaultValue={
              previousValues?.emailAddress ??
              pageData.prevEmailAddress ??
              undefined
            }
            textInputSubtype="email"
          />

          <Button text="Confirm" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default ChangeOwnerPage;
