import { GetServerSideProps } from 'next';
import Link from 'next/link';
import getConfig from 'next/config';
import { Button, SummaryList } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import { User } from '../../types';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { getUserById } from '../../../../services/SuperAdminService';
import { toSentenceCase } from '../../utils';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const sessionCookie = getSessionIdFromCookies(req);
  return {
    props: {
      user: await getUserById(params?.id as string, sessionCookie),
    },
  };
};

type UserPageProps = {
  user: User;
};

const UserPage = ({ user }: UserPageProps) => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Manage User" />
      <div className="govuk-!-padding-top-2">
        <div className="govuk-width-container">
          <a
            href={`${publicRuntimeConfig.SUB_PATH}/super-admin-dashboard`}
            className="govuk-back-link"
            data-cy="cy-back-button"
          >
            Back
          </a>
          <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <span className="govuk-caption-l">{user.emailAddress}</span>
                <h1 className="govuk-heading-l">Manage a user</h1>
                <h2 className="govuk-heading-m">User Information</h2>
                <SummaryList
                  rows={[
                    { key: 'Account created', value: '', action: <></> },
                    { key: 'Email', value: user.emailAddress, action: <></> },
                    {
                      key: 'Department',
                      value: user.department?.name ?? '',
                      action: (
                        <Link
                          href={`/super-admin-dashboard/user/${user.gapUserId}/change-department`}
                        >
                          <a className="govuk-link">Change</a>
                        </Link>
                      ),
                    },
                    {
                      key: 'Roles',
                      value: user.roles
                        .map((role) => toSentenceCase(role.name))
                        .join(', '),
                      action: (
                        <Link
                          href={`/super-admin-dashboard/user/${user.gapUserId}/change-roles`}
                        >
                          <a className="govuk-link">Change</a>
                        </Link>
                      ),
                    },
                  ]}
                />
                <div className="govuk-button-group">
                  <Button text="Delete user" isWarning />
                  <Button text="Block user" isSecondary />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default UserPage;
