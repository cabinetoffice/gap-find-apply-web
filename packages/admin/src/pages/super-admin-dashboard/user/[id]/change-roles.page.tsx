import { Checkboxes, FlexibleQuestionPageLayout } from 'gap-web-ui';
import { CheckboxesProps } from 'gap-web-ui/dist/cjs/components/question-page/inputs/Checkboxes';
import { GetServerSideProps } from 'next';
import { getUserTokenFromCookies } from '../../../../utils/session';
import {
  getUserById,
  getAllRoles,
} from '../../../../services/SuperAdminService';
import UserDetails, { Role } from '../../../../types/UserDetails';
import Meta from '../../../../components/layout/Meta';
import { NextIncomingMessage } from 'next/dist/server/request-meta';
import callServiceMethod from '../../../../utils/callServiceMethod';
import axios from 'axios';
import getConfig from 'next/config';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
  resolvedUrl,
}) => {
  const { id } = params as { id: string };
  await callServiceMethod(
    req,
    res,
    async (body) => {
      typeof body.newUserRoles === 'string' &&
        (body.newUserRoles = [body.newUserRoles]);
      await axios.patch(
        `${process.env.USER_SERVICE_HOST}/user/${id}/role`,
        body
      );
    },
    '',
    ''
  );

  const userToken = getUserTokenFromCookies(req);
  const user: UserDetails = await getUserById(id, userToken);

  const formatRoleName = ({ name, ...rest }: Role) => ({
    ...rest,
    name: ROLE_MAP[name as keyof typeof ROLE_MAP],
  });

  return {
    props: {
      user,
      resolvedUrl,
      roles: (await getAllRoles(userToken)).map(formatRoleName),
      id,
      csrfToken: (req as Req).csrfToken?.() || '',
    },
  };
};

type EditRoleWithIdProps = {
  roles: Role[];
  user: UserDetails;
  csrfToken: string;
  id: number;
  resolvedUrl: string;
};

const EditRoleWithId = ({
  roles,
  csrfToken,
  id,
  user,
  resolvedUrl,
}: EditRoleWithIdProps) => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Manage User - Change Roles" />
      <div className="govuk-!-padding-top-2">
        <div className="govuk-width-container">
          <a
            href={`${publicRuntimeConfig.SUB_PATH}/spadmin-dashboard`}
            className="govuk-back-link"
            data-cy="cy-back-button"
          >
            Back
          </a>
          <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <span className="govuk-caption-l">{user.emailAddress}</span>
                <h1 className="govuk-heading-l">Change the user&apos;s Role</h1>

                <FlexibleQuestionPageLayout
                  formAction={`/apply/admin/${resolvedUrl}`}
                  fieldErrors={[]}
                  csrfToken={csrfToken}
                >
                  <Checkboxes
                    fieldErrors={[]}
                    fieldName="newUserRoles"
                    options={
                      [...roles.map(mapOptions)] as CheckboxesProps['options']
                    }
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
          </main>
        </div>
      </div>
    </>
  );
};

const mapOptions = ({ id, name, description }: Role) => {
  return {
    value: id,
    label: (
      <>
        <span>{name}</span>
        <p className="govuk-hint">{description}</p>
      </>
    ),
  };
};

const ROLE_MAP = {
  FIND: 'Find',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  APPLICANT: 'Applicant',
};

type Req = NextIncomingMessage & {
  csrfToken: () => string;
  cookies: Partial<{
    [key: string]: string;
  }>;
};

export default EditRoleWithId;
