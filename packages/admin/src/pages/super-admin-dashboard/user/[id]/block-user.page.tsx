import { FlexibleQuestionPageLayout } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import { getUserTokenFromCookies } from '../../../../utils/session';
import {
  updateUserRoles,
  getUserById,
  getUserFromJwt,
} from '../../../../services/SuperAdminService';
import Link from 'next/link';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;

  async function handleRequest(_body: { _csrf: string }, jwt: string) {
    await updateUserRoles(userId, [], jwt);
  }

  const fetchPageData = async (jwt: string) => {
    const jwtUser = await getUserFromJwt(jwt);
    const isViewingOwnAccount = jwtUser?.gapUserId === userId;
    const user = isViewingOwnAccount
      ? jwtUser
      : await getUserById(userId as string, jwt);

    return {
      userId,
      isViewingOwnAccount,
      user,
    };
  };

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to block user, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/user/${userId}`,
  });
}

const BlockUserPage = ({
  formAction,
  pageData,
  csrfToken,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => (
  <>
    <Meta title="Block a User" />
    <Link
      href={`/super-admin-dashboard/user/${pageData.userId}`}
      className="govuk-back-link"
    >
      Back
    </Link>
    <div className="govuk-!-padding-top-7">
      <FlexibleQuestionPageLayout
        fieldErrors={fieldErrors}
        csrfToken={csrfToken}
        formAction={formAction}
      >
        <span className="govuk-caption-l">{pageData.user?.emailAddress}</span>
        <h1 className="govuk-heading-l">Block a user</h1>
        <p className="govuk-body">
          Blocking this user will remove their access to Find a grant, but they
          will stay listed in the database and can be unblocked later. Their
          roles will be reset and will need to be restored manually.
        </p>
        {pageData.isViewingOwnAccount && (
          <p className="govuk-body">You cannot block your account.</p>
        )}
        <div className="govuk-button-group">
          {!pageData.isViewingOwnAccount && (
            <button
              className="govuk-button govuk-button--warning"
              data-module="govuk-button"
              type="submit"
            >
              Block user
            </button>
          )}
          <Link
            href={`/super-admin-dashboard/user/${pageData.userId}`}
            className="govuk-link"
          >
            Cancel
          </Link>
        </div>
      </FlexibleQuestionPageLayout>
    </div>
  </>
);

export default BlockUserPage;
