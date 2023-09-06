import { FlexibleQuestionPageLayout } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import { getUserTokenFromCookies } from '../../../../utils/session';
import {
  deleteUserInformation,
  getUserById,
  getUserFromJwt,
} from '../../../../services/SuperAdminService';
import Link from 'next/link';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;

  async function handleRequest(_body: { _csrf: string }, jwt: string) {
    await deleteUserInformation(userId, jwt);
  }

  const fetchPageData = async (jwt: string) => {
    const jwtUser = await getUserFromJwt(jwt);
    const isViewingOwnAccount = jwtUser?.gapUserId === userId;
    const user = {
      ...(isViewingOwnAccount
        ? jwtUser
        : await getUserById(userId as string, jwt)),
    };

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
    onErrorMessage: 'Failed to delete user, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/`,
  });
}

const DeleteUserPage = ({
  formAction,
  pageData,
  csrfToken,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => (
  <>
    <Meta title="Delete User" />
    <Link href={`/super-admin-dashboard/user/${pageData.userId}`}>
      <a className="govuk-back-link">Back</a>
    </Link>
    <div className="govuk-!-padding-top-7">
      <FlexibleQuestionPageLayout
        fieldErrors={fieldErrors}
        csrfToken={csrfToken}
        formAction={formAction}
      >
        <span className="govuk-caption-l">{pageData.user.emailAddress}</span>
        <h1 className="govuk-heading-l">Delete a user</h1>
        <p className="govuk-body">
          If you delete this user&apos;s account, all of their data will be
          lost. You cannot undo this action.
        </p>
        {pageData.isViewingOwnAccount && (
          <p className="govuk-body">You cannot delete your account</p>
        )}
        <div className="govuk-button-group">
          {!pageData.isViewingOwnAccount && (
            <button
              className="govuk-button govuk-button--warning"
              data-module="govuk-button"
            >
              Delete user
            </button>
          )}
          <Link href={`/super-admin-dashboard/user/${pageData.userId}`}>
            <a className="govuk-link">Cancel</a>
          </Link>
        </div>
      </FlexibleQuestionPageLayout>
    </div>
  </>
);

export default DeleteUserPage;
