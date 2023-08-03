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
  deleteUserInformation,
  getUserById,
} from '../../../../services/SuperAdminService';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;

  async function handleRequest(_body: { _csrf: string }, jwt: string) {
    deleteUserInformation(userId, jwt);
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
    onErrorMessage: 'Failed to delete user, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/`,
  });
}

const DeleteUserPage = ({
  formAction,
  pageData,
  csrfToken,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Delete Department" />
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
          <h1 className="govuk-heading-l">Delete a user</h1>
          <p className="govuk-body">
            If you delete this user&apos;s account, all of their data will be
            lost. You cannot undo this action.
          </p>
          <div className="govuk-button-group">
            <button
              className="govuk-button govuk-button--warning"
              data-module="govuk-button"
            >
              Delete user
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

export default DeleteUserPage;
