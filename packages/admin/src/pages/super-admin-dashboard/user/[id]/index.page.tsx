import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import getConfig from 'next/config';
import { SummaryList } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import { User } from '../../types';
import { getUserTokenFromCookies } from '../../../../utils/session';
import { getUserById } from '../../../../services/SuperAdminService';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { fetchDataOrGetRedirect } from '../../../../utils/fetchDataOrGetRedirect';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const userToken = getUserTokenFromCookies(req);

  const getPageData = () => getUserById(params?.id as string, userToken);
  return await fetchDataOrGetRedirect(getPageData);
};

const UserPage = (user: User) => {
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
                      value: user.role?.label || 'Blocked',
                      action: user.role?.label ? (
                        <Link
                          href={`/super-admin-dashboard/user/${user.gapUserId}/change-roles`}
                        >
                          <a className="govuk-link">Change</a>
                        </Link>
                      ) : (
                        <></>
                      ),
                    },
                  ]}
                />
                <div className="govuk-button-group">
                  <CustomLink
                    href={`/super-admin-dashboard/user/${user.gapUserId}/delete-user`}
                    customStyle="govuk-button govuk-button--warning"
                    data-module="govuk-button"
                  >
                    Delete user
                  </CustomLink>
                  {!user.role?.label && (
                    <CustomLink
                      href={`/api/unblockUser?id=${user.gapUserId}`}
                      customStyle="govuk-button govuk-button--secondary"
                    >
                      Unblock user
                    </CustomLink>
                  )}

                  {user.role?.label && (
                    <CustomLink
                      href={`/super-admin-dashboard/user/${user.gapUserId}/block-user`}
                      customStyle="govuk-button govuk-button--secondary"
                    >
                      Block user
                    </CustomLink>
                  )}
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
