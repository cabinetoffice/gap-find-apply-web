import {
  Button,
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
  TextInput,
} from 'gap-web-ui';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import InferProps from '../../../../../../types/InferProps';
import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../../../utils/session';
import { checkNewAdminEmailIsValid } from '../../../../../../services/UserService';
import { getGrantScheme } from '../../../../../../services/SchemeService';

type PageBodyResponse = {
  emailAddress: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { userId, schemeId } = context.params as Record<string, string>;

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    return checkNewAdminEmailIsValid(
      jwt,
      getUserTokenFromCookies(context.req),
      body.emailAddress
    );
  }

  async function fetchPageData(jwt: string) {
    const scheme = await getGrantScheme(schemeId, jwt);
    return {
      userId: userId ?? null,
      scheme,
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
    onSuccessRedirectHref: `/super-admin-dashboard/user/${userId}/schemes/${schemeId}/confirm-change-owner`,
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
        }Manage User - Change Department`}
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
          <span className="govuk-caption-xl">{pageData.scheme.name}</span>
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
            defaultValue={previousValues?.emailAddress}
            textInputSubtype="email"
          />

          <Button text="Confirm" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default ChangeOwnerPage;
