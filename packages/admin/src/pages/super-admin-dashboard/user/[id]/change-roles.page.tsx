import { Checkboxes, FlexibleQuestionPageLayout } from 'gap-web-ui';

import { GetServerSidePropsContext } from 'next';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../utils/session';
import {
  getUserById,
  getAllRoles,
  updateUserRoles,
  getUserFromJwt,
} from '../../../../services/SuperAdminService';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import CustomLink from '../../../../components/custom-link/CustomLink';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import { getAdminsSchemes } from '../../../../services/SchemeService';

type PageBodyResponse = {
  newUserRoles: string | string[];
};

const doesUserHaveSchemes = async (
  context: GetServerSidePropsContext,
  userId: string
): Promise<boolean> => {
  const userToken = getUserTokenFromCookies(context.req);
  const sessionId = getSessionIdFromCookies(context.req);
  const jwtUser = await getUserFromJwt(userToken);
  const isViewingOwnAccount = jwtUser?.gapUserId === userId;
  const user = isViewingOwnAccount
    ? jwtUser
    : await getUserById(userId, userToken);
  const sub = user?.sub ? user.sub : user.colaSub;
  const usersSchemes = await getAdminsSchemes(sub, sessionId);
  return usersSchemes.length > 0;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;
  const APPLICANT_ROLES_IDS = ['1', '2'];
  const ADMIN_ROLES_IDS = ['3', '4', '5'];

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    let departmentPageUrl = `/super-admin-dashboard/user/${userId}/change-department`;
    const oldUserRoles = (await getUserById(userId, jwt)).roles.map((role) =>
      String(role.id)
    );
    const newUserRoles = APPLICANT_ROLES_IDS.concat(body.newUserRoles || []);
    const userDepartment = (await getUserById(userId, jwt)).department;

    const isBeingDemotedFromAdmin =
      hasAdminRole(oldUserRoles) && !hasAdminRole(newUserRoles);
    if (isBeingDemotedFromAdmin) {
      const userHasSchemes = await doesUserHaveSchemes(context, userId);
      if (userHasSchemes) {
        // reject
      }
    }

    const isBeingPromotedToAdmin =
      !hasAdminRole(oldUserRoles) && hasAdminRole(newUserRoles);
    if (isBeingPromotedToAdmin) {
      departmentPageUrl += `?newRoles=${newUserRoles}`;
      return { userDepartment, newUserRoles, userId, departmentPageUrl };
    }
    await updateUserRoles(userId, newUserRoles, jwt);
    return { userDepartment, newUserRoles, userId, departmentPageUrl };
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
    departmentPageUrl,
  }: Awaited<ReturnType<typeof handleRequest>>) {
    const userHasDepartment = userDepartment !== null;
    const userBecomingApplicant = !hasAdminRole(newUserRoles);

    return userHasDepartment || userBecomingApplicant
      ? `/super-admin-dashboard/user/${userId}`
      : departmentPageUrl;
  }

  function hasAdminRole(roles: string[]) {
    return roles.some((role) => ADMIN_ROLES_IDS.includes(role));
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
