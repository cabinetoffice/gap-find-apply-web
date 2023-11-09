import { Button, FlexibleQuestionPageLayout } from 'gap-web-ui';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import InferProps from '../../../../../../types/InferProps';
import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../../../utils/session';
import {
  changeSchemeOwnership,
  getGrantScheme,
} from '../../../../../../services/SchemeService';
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

  async function handleRequest(body: PageBodyResponse, sessionId: string) {
    return changeSchemeOwnership(
      schemeId,
      sessionId,
      getUserTokenFromCookies(context.req),
      newEmailAddress
    );
  }

  async function fetchPageData(jwt: string) {
    const scheme = await getGrantScheme(schemeId, jwt);
    return {
      oldEmailAddress,
      newEmailAddress,
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
    onSuccessRedirectHref: `/super-admin-dashboard/user/${userId}`,
  });
}

const ConfirmChangeOwnerPage = ({
  fieldErrors,
  formAction,
  csrfToken,
  pageData,
}: InferProps<typeof getServerSideProps>) => {
  const backButtonHref = `/super-admin-dashboard/user/${
    pageData.userId
  }/schemes/${
    pageData.scheme.schemeId
  }/change-owner?oldEmailAddress=${encodeURIComponent(
    pageData.oldEmailAddress
  )}`;

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
          <span className="govuk-caption-xl">{pageData.scheme.name}</span>
          <h1 className="govuk-heading-l">Confirm change of ownership</h1>

          <p className="govuk-body">
            The grant {pageData.scheme.name} will be transferred from{' '}
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
