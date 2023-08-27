import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import getConfig from 'next/config';
import { SummaryList } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import { User } from '../../types';
import { getUserTokenFromCookies } from '../../../../utils/session';
import {
  getUserById,
  getUserFromJwt,
} from '../../../../services/SuperAdminService';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { fetchDataOrGetRedirect } from '../../../../utils/fetchDataOrGetRedirect';
import moment from 'moment';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const userToken = getUserTokenFromCookies(req);

  const getPageData = async () => {
    const jwtUser = await getUserFromJwt(userToken);
    const isViewingOwnAccount = jwtUser?.gapUserId === params?.id;

    return {
      isViewingOwnAccount,
      ...(isViewingOwnAccount
        ? jwtUser
        : await getUserById(params?.id as string, userToken)),
    };
  };

  return await fetchDataOrGetRedirect(getPageData);
};

const UserPage = (pageData: User & { isViewingOwnAccount: boolean }) => {
  const { publicRuntimeConfig } = getConfig();
  function createdDate() {
    if (pageData.created) {
      return moment(pageData.created).format('DD MMMM YYYY');
    } else {
      return '-';
    }
  }

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
                <span className="govuk-caption-l">{pageData.emailAddress}</span>
                <h1 className="govuk-heading-l">Manage a user</h1>
                <h2 className="govuk-heading-m">User Information</h2>
                <SummaryList
                  rows={[
                    {
                      key: 'Account created',
                      value: createdDate(),
                      action: <></>,
                    },
                    {
                      key: 'Email',
                      value: pageData.emailAddress,
                      action: <></>,
                    },
                    {
                      key: 'Department',
                      value: pageData.department?.name ?? '',
                      action: (
                        <Link
                          href={`/super-admin-dashboard/user/${pageData.gapUserId}/change-department`}
                        >
                          <a className="govuk-link">Change</a>
                        </Link>
                      ),
                    },
                    {
                      key: 'Roles',
                      value: pageData.role?.label || 'Blocked',
                      action: pageData.role?.label ? (
                        <Link
                          href={`/super-admin-dashboard/user/${pageData.gapUserId}/change-roles`}
                        >
                          <a className="govuk-link">Change</a>
                        </Link>
                      ) : (
                        <></>
                      ),
                    },
                  ]}
                />
                {!pageData.isViewingOwnAccount && (
                  <div className="govuk-button-group">
                    <CustomLink
                      href={`/super-admin-dashboard/user/${pageData.gapUserId}/delete-user`}
                      customStyle="govuk-button govuk-button--warning"
                      data-module="govuk-button"
                    >
                      Delete user
                    </CustomLink>
                    {!pageData.role?.label && (
                      <CustomLink
                        href={`/api/unblockUser?id=${pageData.gapUserId}`}
                        customStyle="govuk-button govuk-button--secondary"
                      >
                        Unblock user
                      </CustomLink>
                    )}

                    {pageData.role?.label && (
                      <CustomLink
                        href={`/super-admin-dashboard/user/${pageData.gapUserId}/block-user`}
                        customStyle="govuk-button govuk-button--secondary"
                      >
                        Block user
                      </CustomLink>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default UserPage;
