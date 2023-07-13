import { Checkboxes, FlexibleQuestionPageLayout } from 'gap-web-ui';
import { CheckboxesProps } from 'gap-web-ui/dist/cjs/components/question-page/inputs/Checkboxes';
import { GetServerSideProps } from 'next';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { getUserFromSub } from '../../../../services/UserService';
import UserDetails, { Role } from '../../../../types/UserDetails';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { getAllRoles } from '../../../../services/RoleService';

const ROLE_MAP = {
  FIND: 'Find',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  APPLICANT: 'Applicant',
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { id } = params as { id: string };
  const sessionCookie = getSessionIdFromCookies(req);
  const user: UserDetails = await getUserFromSub(sessionCookie, id);

  const formatRoleName = ({ name, ...rest }: Role) => ({
    ...rest,
    name: ROLE_MAP[name as keyof typeof ROLE_MAP],
  });
  const roles = (await getAllRoles(sessionCookie)).map(formatRoleName);
  return {
    props: {
      user,
      roles,
      id,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const EditRoleWithId = ({
  roles,
  user,
  csrfToken,
  id,
  backHref,
}: {
  roles: Role[];
  user: UserDetails;
  csrfToken: string;
  id: number;
  backHref: string;
}) => (
  <>
    <Meta title="Admin Dashboard" />
    <CustomLink href={backHref} isBackButton />
    <br />
    <p className="govuk-hint govuk-!-margin-bottom-0">{user.emailAddress}</p>
    <FlexibleQuestionPageLayout
      formAction={`${process.env.USER_SERVICE_HOST}/spadmin/edit-role/${id}`}
      fieldErrors={[]}
      csrfToken={csrfToken}
    >
      <Checkboxes
        fieldErrors={[]}
        questionTitle="Change the user's roles"
        fieldName="newUserRoles"
        options={[...roles.map(mapOptions)] as CheckboxesProps['options']}
        defaultCheckboxes={user.roles.map(({ id }) => id)}
      />
      <div className="govuk-button-group">
        <button className="govuk-button" data-module="govuk-button">
          Change Roles
        </button>
      </div>
    </FlexibleQuestionPageLayout>
  </>
);

const mapOptions = ({ id, name, description }: Role) => {
  return {
    value: id,
    label: (
      <>
        <span>{name}</span>
        <p>{description}</p>
      </>
    ),
  };
};

export default EditRoleWithId;
