import {
  Checkboxes,
  FlexibleQuestionPageLayout,
  ValidationError,
} from 'gap-web-ui';

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
import { Role, User } from '../../types';

type PageBodyResponse = {
  newUserRoles: string | string[];
};

const ROLE_IDS = {
  FIND: '1',
  APPLICANT: '2',
  ADMIN: '3',
  SUPER_ADMIN: '4',
  TECH_SUPPORT: '5',
};
const APPLICANT_ROLES_IDS = [ROLE_IDS.FIND, ROLE_IDS.APPLICANT];
const ADMIN_ROLES_IDS = [
  ROLE_IDS.ADMIN,
  ROLE_IDS.SUPER_ADMIN,
  ROLE_IDS.TECH_SUPPORT,
];

function hasAdminRoleId(roleIds: string[]) {
  return roleIds.some((roleId) => ADMIN_ROLES_IDS.includes(roleId));
}

function hasAdminRole(roles: Role[]) {
  return roles.some(({ id }) => ADMIN_ROLES_IDS.includes(String(id)));
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;
  const isOwner = (context.query?.isOwner === 'true') as boolean;

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    let departmentPageUrl = `/super-admin-dashboard/user/${userId}/change-department`;

    const oldUserRoles = (await getUserById(userId, jwt)).roles.map((role) =>
      String(role.id)
    );

    let newUserRoles = APPLICANT_ROLES_IDS.concat(body.newUserRoles || []);
    // If we're promoting a user to Super Admin, we must add the Admin role as well
    const isSuperAdminOnly =
      newUserRoles.includes(ROLE_IDS.SUPER_ADMIN) &&
      !newUserRoles.includes(ROLE_IDS.ADMIN);
    // We disable the Admin checkbox when the user is an Admin that owns a grant, so that an Owner can't be demoted.
    // However, as per https://stackoverflow.com/questions/4727974/how-to-post-submit-an-input-checkbox-that-is-disabled
    // and according to the W3 spec http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2, a disabled checkbox
    // does not post its value when the form submits - "Controls that are disabled cannot be successful."
    // Therefore, we must check for previous admin role & ownership, and append the Admin role id if needed.
    // The same logic is performed for deciding whether to disable the checkbox.
    // The alternative solution for posting the value is to add a hidden input with the admin value and post that,
    // but the below is cleaner since we're pushing the admin role already for Super Admin promotion.
    const isOwnerAndAdmin = isOwner && hasAdminRoleId(oldUserRoles);
    if (isSuperAdminOnly || isOwnerAndAdmin) newUserRoles.push(ROLE_IDS.ADMIN);
    // remove duplicates
    newUserRoles = [...new Set(newUserRoles)].sort();

    const userDepartment = (await getUserById(userId, jwt)).department;

    if (hasAdminRoleId(newUserRoles) && !hasAdminRoleId(oldUserRoles)) {
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
      isOwner,
    };
  }

  function onSuccessRedirectHref({
    userDepartment,
    newUserRoles,
    userId,
    departmentPageUrl,
  }: Awaited<ReturnType<typeof handleRequest>>) {
    const userHasDepartment = userDepartment !== null;
    const userBecomingApplicant = !hasAdminRoleId(newUserRoles);

    return userHasDepartment || userBecomingApplicant
      ? `/super-admin-dashboard/user/${userId}`
      : departmentPageUrl;
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
  const { user, roles, isOwner } = pageData;
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
            {renderConditionalCheckboxes(isOwner, fieldErrors, roles, user)}

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

function renderConditionalCheckboxes(
  isOwner: boolean,
  fieldErrors: ValidationError[],
  roles: Role[],
  user: User
) {
  const adminCheckboxes = roles.filter(({ name }) => name === 'ADMIN');
  const isAdmin = hasAdminRole(user.roles);
  if (isOwner && isAdmin) {
    return (
      <>
        <div>
          <p className="govuk-body govuk-!-margin-bottom-0">
            While this user owns grants, you cannot demote them to an applicant.
          </p>
          <Checkboxes
            fieldErrors={fieldErrors}
            fieldName="newUserRoles"
            options={roles.map(renderCheckbox)}
            defaultCheckboxes={user.roles.map(({ id }) => String(id))}
            disabledCheckboxes={adminCheckboxes.map(({ id }) => String(id))}
          />
        </div>
      </>
    );
  } else {
    return (
      <Checkboxes
        fieldErrors={fieldErrors}
        fieldName="newUserRoles"
        options={roles.map(renderCheckbox)}
        defaultCheckboxes={user.roles.map(({ id }) => String(id))}
      />
    );
  }
}

const renderCheckbox = ({ id, label, description }: Role) => ({
  value: String(id),
  label: (
    <div>
      <span>{label}</span>
      <p className="govuk-hint">{description}</p>
    </div>
  ),
});

export default EditRoleWithId;
