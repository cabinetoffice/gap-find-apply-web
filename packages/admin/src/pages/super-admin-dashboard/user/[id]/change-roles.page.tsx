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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;
  const isOwner = (context.query?.isOwner === 'true') as boolean;
  const APPLICANT_ROLES_IDS = ['1', '2'];
  const ADMIN_ROLES_IDS = ['3', '4', '5'];

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    let departmentPageUrl = `/super-admin-dashboard/user/${userId}/change-department`;
    const oldUserRoles = (await getUserById(userId, jwt)).roles.map((role) =>
      String(role.id)
    );
    const newUserRoles = APPLICANT_ROLES_IDS.concat(body.newUserRoles || []);
    const userDepartment = (await getUserById(userId, jwt)).department;

    if (hasAdminRole(newUserRoles) && !hasAdminRole(oldUserRoles)) {
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
  const adminCheckbox = roles.filter(({ name }) => name === 'ADMIN');
  const otherCheckboxes = roles.filter(({ name }) => name !== 'ADMIN');
  console.log('user roles: ', user.roles);
  if (isOwner) {
    return (
      <>
        <div>
          <p className="govuk-body govuk-!-margin-bottom-0">
            While this user owns grants, you cannot demote them to an applicant.
          </p>
          <Checkboxes
            fieldErrors={fieldErrors}
            fieldName="newUserRoles"
            options={adminCheckbox.map(({ id, label, description }) => ({
              value: String(id),
              label: (
                <div>
                  <span>{label}</span>
                  <p className="govuk-hint">{description}</p>
                </div>
              ),
            }))}
            defaultCheckboxes={adminCheckbox.map(({ id }) => String(id))}
            disabled
          />
          <Checkboxes
            fieldErrors={fieldErrors}
            fieldName="newUserRoles"
            options={otherCheckboxes.map(({ id, label, description }) => ({
              value: String(id),
              label: (
                <div>
                  <span>{label}</span>
                  <p className="govuk-hint">{description}</p>
                </div>
              ),
            }))}
            defaultCheckboxes={user.roles.map(({ id }) => String(id))}
          />
        </div>
      </>
    );
  } else {
    return (
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
    );
  }
}
export default EditRoleWithId;
