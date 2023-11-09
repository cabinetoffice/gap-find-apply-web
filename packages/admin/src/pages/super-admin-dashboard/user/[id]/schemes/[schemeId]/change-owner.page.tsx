import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import InferProps from '../../../../../../types/InferProps';
import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../../../utils/session';
import { checkNewAdminEmailIsValid } from '../../../../../../services/UserService';
import QuestionPageGetServerSideProps from '../../../../../../utils/QuestionPageGetServerSideProps';

type PageBodyResponse = {
  emailAddress: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id: userId, schemeId } = context.params as Record<string, string>;
  const oldEmailAddress = decodeURIComponent(
    context.query.oldEmailAddress as string
  );
  const newEmailAddress = context.query.newEmailAddress
    ? decodeURIComponent(context.query.newEmailAddress as string)
    : null;
  const schemeName = decodeURIComponent(context.query.schemeName as string);

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    await checkNewAdminEmailIsValid(
      jwt,
      getUserTokenFromCookies(context.req),
      body.emailAddress
    );
    return body.emailAddress;
  }

  async function fetchPageData() {
    return {
      userId: userId ?? null,
      schemeName,
      prevEmailAddress: newEmailAddress,
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
    onErrorMessage: 'Failed to change scheme owner.',
    onSuccessRedirectHref: (emailAddress) =>
      `/super-admin-dashboard/user/${userId}/schemes/${schemeId}/confirm-change-owner?newEmailAddress=${encodeURIComponent(
        emailAddress
      )}&oldEmailAddress=${encodeURIComponent(
        oldEmailAddress
      )}&schemeName=${encodeURIComponent(schemeName)}`,
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
        }Manage User - Change Scheme Owner`}
      />

      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/user/${pageData.userId}`}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <span className="govuk-caption-xl">{pageData.schemeName}</span>
          <h1 className="govuk-heading-l">Select a new owner</h1>

          <p className="govuk-body">
            You can select any admin account on the Find a grant service as a
            new owner for this grant.
          </p>
          <p className="govuk-body">
            The new owner will be able to view, edit, and delete this grant. The
            previous owner will no longer be able to access this grant.
          </p>

          <TextInput
            questionTitle="New owner's email address"
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
