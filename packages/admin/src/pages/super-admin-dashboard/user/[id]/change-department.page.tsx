import { FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import {
  getChangeDepartmentPage,
  updateDepartment,
  updateUserRoles,
} from '../../../../services/SuperAdminService';
import InferProps from '../../../../types/InferProps';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import { getUserTokenFromCookies } from '../../../../utils/session';

type PageBodyResponse = {
  department: number;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    const newUserRolesParam = context.query?.newRoles as string | undefined;
    const newUserRoles = newUserRolesParam?.split?.(',');

    if (
      newUserRoles &&
      newRolesAreAdminRoles(newUserRoles) &&
      body.department
    ) {
      await updateUserRoles(userId, newUserRoles, jwt, body.department);
    }
    return await updateDepartment(userId, body.department, jwt);
  }

  function fetchPageData(jwt: string) {
    return getChangeDepartmentPage(userId, jwt);
  }

  function newRolesAreAdminRoles(newRoles: string[]) {
    const ADMIN_ROLES_IDS = ['3', '4', '5'];
    return newRoles.some((role) => ADMIN_ROLES_IDS.includes(role));
  }

  return QuestionPageGetServerSideProps<
    PageBodyResponse,
    Awaited<ReturnType<typeof getChangeDepartmentPage>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to update department, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/user/${userId}`,
  });
}

const UserPage = ({
  csrfToken,
  pageData,
  formAction,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  const { user, departments } = pageData;
  const newUserRolesList = formAction.split('newRoles=');
  const newUserRoles = newUserRolesList ? newUserRolesList[1] : null;

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Manage User - Change Department`}
      />

      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/user/${user.gapUserId}`}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          csrfToken={csrfToken}
          fieldErrors={fieldErrors}
        >
          <span className="govuk-caption-l">{user.emailAddress}</span>
          <h1 className="govuk-heading-l">Change the user&apos;s department</h1>

          <Radio
            fieldName="department"
            radioOptions={departments.map((department) => ({
              label: department.name,
              value: department.id,
            }))}
            fieldErrors={fieldErrors}
            defaultChecked={user.department?.name}
          />

          <div className="govuk-button-group">
            <button className="govuk-button" data-module="govuk-button">
              Change department
            </button>

            <CustomLink
              href={
                newUserRoles
                  ? `/super-admin-dashboard/manage-departments?userId=${user.gapUserId}&newRoles=${newUserRoles}`
                  : `/super-admin-dashboard/manage-departments?userId=${user.gapUserId}`
              }
            >
              Manage departments
            </CustomLink>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default UserPage;
