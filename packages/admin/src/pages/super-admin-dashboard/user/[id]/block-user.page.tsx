import {
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import { getUserTokenFromCookies } from '../../../../utils/session';
import Link from 'next/link';
import {
  updateUserRoles,
  getUserById,
} from '../../../../services/SuperAdminService';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;

  async function handleRequest(_body: { _csrf: string }, jwt: string) {
    updateUserRoles(userId, [], jwt);
  }

  async function fetchPageData(jwt: string) {
    const user = await getUserById(userId, jwt);
    return {
      user,
      userId,
    };
  }

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to block user, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/`,
  });
}

const BlockUserPage = ({
  formAction,
  pageData,
  csrfToken,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Block a User" />
      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/user/${pageData.userId}`}
      />
      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <span className="govuk-caption-l">{pageData.user.emailAddress}</span>
          <h1 className="govuk-heading-l">Block a user</h1>
          <p className="govuk-body">
            Blocking this user will remove their access to Find a grant, but
            they will stay listed in the database and can be unblocked later.
            Their roles will be reset and will need to be restored manually.
          </p>
          <div className="govuk-button-group">
            <button
              className="govuk-button govuk-button--warning"
              data-module="govuk-button"
            >
              Block user
            </button>
            <Link href={`/super-admin-dashboard/user/${pageData.userId}`}>
              <a className="govuk-link">Cancel</a>
            </Link>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default BlockUserPage;
