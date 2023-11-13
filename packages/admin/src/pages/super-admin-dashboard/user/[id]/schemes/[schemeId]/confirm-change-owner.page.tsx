import { Button, FlexibleQuestionPageLayout } from 'gap-web-ui';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import InferProps from '../../../../../../types/InferProps';
import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../../../utils/session';
import { changeSchemeOwnership } from '../../../../../../services/SchemeService';
import QuestionPageGetServerSideProps from '../../../../../../utils/QuestionPageGetServerSideProps';

type PageBodyResponse = {
  emailAddress: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id: userId, schemeId } = context.params as Record<string, string>;
  const oldEmailAddress = decodeURIComponent(
    context.query.oldEmailAddress as string
  );
  const newEmailAddress = decodeURIComponent(
    context.query.newEmailAddress as string
  );
  const schemeName = decodeURIComponent(context.query.schemeName as string);

  async function handleRequest(body: PageBodyResponse, sessionId: string) {
    return changeSchemeOwnership(
      schemeId,
      sessionId,
      getUserTokenFromCookies(context.req),
      newEmailAddress
    );
  }

  async function fetchPageData() {
    return {
      oldEmailAddress,
      newEmailAddress,
      userId: userId ?? null,
      schemeId: schemeId ?? null,
      schemeName,
    };
  }

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getSessionIdFromCookies(context.req),
    onErrorMessage: 'Failed to change scheme owner.',
    onSuccessRedirectHref: `/super-admin-dashboard/user/${userId}`,
  });
}

const ConfirmChangeOwnerPage = ({
  fieldErrors,
  formAction,
  csrfToken,
  pageData,
}: InferProps<typeof getServerSideProps>) => {
  const queryParams = new URLSearchParams({
    oldEmailAddress: pageData.oldEmailAddress,
    newEmailAddress: pageData.newEmailAddress,
    schemeName: pageData.schemeName,
  }).toString();
  const backButtonHref = `/super-admin-dashboard/user/${pageData.userId}/schemes/${pageData.schemeId}/change-owner?${queryParams}`;

  return (
    <>
      <Meta title={`Manage User - Confirm Change Scheme Owner`} />

      <CustomLink isBackButton href={backButtonHref} />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <span className="govuk-caption-xl">{pageData.schemeName}</span>
          <h1 className="govuk-heading-l">Confirm change of ownership</h1>

          <p className="govuk-body">
            The grant {pageData.schemeName} will be transferred from{' '}
            <span className="govuk-!-font-weight-bold">
              {pageData.oldEmailAddress}
            </span>{' '}
            to{' '}
            <span className="govuk-!-font-weight-bold">
              {pageData.newEmailAddress}
            </span>
            {'.'}
          </p>

          <div className="govuk-button-group">
            <Button text="Confirm transfer" />
            <CustomLink href={backButtonHref}>Cancel</CustomLink>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default ConfirmChangeOwnerPage;
