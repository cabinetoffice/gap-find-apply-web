import { Checkboxes, FlexibleQuestionPageLayout } from 'gap-web-ui';

import { GetServerSidePropsContext } from 'next';
import { getUserTokenFromCookies } from '../../../../utils/session';
import {
  getUserById,
  getAllRoles,
  updateUserRoles,
} from '../../../../services/SuperAdminService';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import CustomLink from '../../../../components/custom-link/CustomLink';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';

type PageBodyResponse = {
  newUserRoles: string | string[];
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;

  async function handleRequest(
    body: PageBodyResponse,
    jwt: string,
    _pageData: Awaited<ReturnType<typeof fetchPageData>>
  ) {
    const findAndApplicantRoles = ['1', '2'];
    const newUserRoles = findAndApplicantRoles.concat(body.newUserRoles || []);
    const userDepartment = (await getUserById(userId, jwt)).department;
    await updateUserRoles(userId, newUserRoles, jwt);
    return { userDepartment, newUserRoles, userId };
  }

  async function fetchPageData(jwt: string) {
    const user = await getUserById(userId, jwt);
    const roles = await getAllRoles(jwt);

    return {
      user,
      roles: roles.filter(
        ({ name }) => name !== 'APPLICANT' && name !== 'FIND'
      ),
      userId,
    };
  }

  function onSuccessRedirectHref({
    userDepartment,
    newUserRoles,
    userId,
  }: Awaited<ReturnType<typeof handleRequest>>) {
    const ADMIN_ROLES = ['3', '4', '5'];

    const userHasDepartment = userDepartment !== null;
    const userBecomingApplicant = !newUserRoles.some((role) =>
      ADMIN_ROLES.includes(role)
    );

    return userHasDepartment || userBecomingApplicant
      ? `/super-admin-dashboard/user/${userId}`
      : `/super-admin-dashboard/user/${userId}/change-department`;
  }

  return QuestionPageGetServerSideProps<
    PageBodyResponse,
    Awaited<ReturnType<typeof fetchPageData>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to update roles, please try again later.',
    onSuccessRedirectHref,
  });
}

const EditRoleWithId = ({
  pageData,
  csrfToken,
  formAction,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  const { user, roles } = pageData;
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Manage User - Change Roles`}
      />

      <div className="govuk-width-container">
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
            <span className="govuk-caption-l">{user.emailAddress}</span>
            <h1 className="govuk-heading-l">Change the user&apos;s Role</h1>

            <Checkboxes
              fieldErrors={fieldErrors}
              fieldName="newUserRoles"
              options={roles.map(({ id, label, description }) => ({
                value: String(id),
                label: (
                  <>
                    <span>{label}</span>
                    <p className="govuk-hint">{description}</p>
                  </>
                ),
              }))}
              defaultCheckboxes={user.roles.map(({ id }) => String(id))}
            />

            <div className="govuk-button-group">
              <button className="govuk-button" data-module="govuk-button">
                Change Roles
              </button>
            </div>
          </FlexibleQuestionPageLayout>
        </div>
      </div>
    </>
  );
};

export default EditRoleWithId;
